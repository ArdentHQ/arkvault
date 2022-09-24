import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo, useState } from "react";
import { kebabCase, upperFirst } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import {
	DateRange,
	ExportProgressStatus,
	ExportSettings,
} from "@/domains/transaction/components/TransactionExportModal";
import { TransactionExporter } from "@/domains/transaction/components/TransactionExportModal/utils/transaction-exporter.factory";

const getTimestampRange = (dateRange: DateRange, from?: Date, to?: Date) => {
	if (dateRange === DateRange.All) {
		return {};
	}

	if (dateRange === DateRange.Custom) {
		return {
			from: DateTime.make(from!.toString()).startOf("day").toUNIX(),
			to: DateTime.make(to!.toString()).endOf("day").toUNIX(),
		};
	}

	const [offset, period] = kebabCase(dateRange)!.split("-");

	const timestamp: {
		from?: number;
		to?: number;
	} = {};

	timestamp.from = DateTime.make()
		.startOf(period as any)
		.toUNIX();

	if (offset === "last") {
		timestamp.from = DateTime.fromUnix(timestamp.from)[`sub${upperFirst(period)}`]().toUNIX();
		timestamp.to = DateTime.make()
			.startOf(period as any)
			.subSecond()
			.toUNIX();
	}

	return timestamp;
};

export const useTransactionExport = ({
	profile,
	wallet,
	initialStatus,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	initialStatus: ExportProgressStatus;
}) => {
	const [status, setStatus] = useState<ExportProgressStatus>(initialStatus);
	const [finalCount, setFinalCount] = useState<number>(0);
	const [error, setError] = useState<string>();

	const [file] = useState({
		content: "",
		extension: "csv",
		name: wallet.address(),
	});

	const exporter = useMemo(() => TransactionExporter({ profile, wallet }), [profile, wallet]);

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
			setStatus(ExportProgressStatus.Progress);

			const dateRange = getTimestampRange(settings.dateRange, settings.from, settings.to);

			try {
				const transactionCount = await exporter
					.transactions()
					.sync({ dateRange, type: settings.transactionType });

				/* istanbul ignore if */
				if (transactionCount === undefined) {
					return;
				}

				setFinalCount(transactionCount);
				setStatus(ExportProgressStatus.Success);

				file.content = exporter.transactions().toCsv(settings);
			} catch (error) {
				setError(error.message);
				setStatus(ExportProgressStatus.Error);
				return;
			}
		},
		status,
	};
};
