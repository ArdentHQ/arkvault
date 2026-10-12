import {
	DateRange,
	ExportProgressStatus,
	ExportSettings,
} from "@/domains/transaction/components/TransactionExportModal";
import { kebabCase, upperFirst } from "@/app/lib/helpers";
import { useMemo, useState } from "react";

import { Contracts } from "@/app/lib/profiles";
import { DateTime } from "@/app/lib/intl";
import { TransactionExporter } from "@/domains/transaction/components/TransactionExportModal/utils/transaction-exporter.factory";
import { useTranslation } from "react-i18next";

const getTimestampRange = (dateRange: DateRange, from?: Date, to?: Date) => {
	if (dateRange === DateRange.All) {
		return {};
	}

	if (dateRange === DateRange.Custom) {
		return {
			from: DateTime.make(from!).startOf("day").valueOf(),
			to: DateTime.make(to!).endOf("day").valueOf(),
		};
	}

	const [offset, period] = kebabCase(dateRange)!.split("-");

	const timestamp: {
		from?: number;
		to?: number;
	} = {};

	const start = DateTime.make().startOf(period as any);

	timestamp.from = (offset === "last" ? start[`sub${upperFirst(period)}`]() : start).valueOf();

	if (offset === "last") {
		timestamp.to = start.subSecond().valueOf();
	}

	return timestamp;
};

export const useTransactionExport = ({
	profile,
	wallets,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
}) => {
	const [status, setStatus] = useState<ExportProgressStatus>(ExportProgressStatus.Idle);
	const [finalCount, setFinalCount] = useState<number>(0);
	const [error, setError] = useState<string>();

	const [file] = useState({
		content: "",
		extension: "csv",
		name: wallets.map((w) => w.address()).join("-"),
	});

	const { t } = useTranslation();

	const addresses = wallets.map((w) => w.address()).join("-");

	const exporter = useMemo(() => TransactionExporter({ profile, wallets }), [profile, addresses]);

	return {
		cancelExport: () => {
			exporter.transactions().abortSync();
			setStatus(ExportProgressStatus.Idle);
		},
		count: exporter.transactions().count(),
		error,
		file,
		finalCount,
		resetStatus: () => {
			setStatus(ExportProgressStatus.Idle);
		},
		startExport: async (settings: ExportSettings) => {
			setFinalCount(0);

			setStatus(ExportProgressStatus.Progress);

			const dateRange = getTimestampRange(settings.dateRange, settings.from, settings.to);

			try {
				const transactionCount = await exporter
					.transactions()
					.sync({ dateRange, type: settings.transactionType });

				if (transactionCount === undefined) {
					return;
				}

				setFinalCount(transactionCount);
				setStatus(ExportProgressStatus.Success);

				file.content = exporter.transactions().toCsv(settings);
			} catch (error) {
				const transactionCount = exporter.transactions().count();

				if (transactionCount > 0) {
					setError(t("TRANSACTION.EXPORT.PROGRESS.FETCHED_PARTIALLY"));
					setFinalCount(exporter.transactions().count());

					file.content = exporter.transactions().toCsv(settings);
				} else {
					setError(error.message);
				}

				setStatus(ExportProgressStatus.Error);

				return;
			}
		},
		status,
	};
};
