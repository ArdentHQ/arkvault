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
			to: DateTime.make(to!.toString()).startOf("day").addDay().subSecond().toUNIX(),
			// to: DateTime.make(to!.toString()).endOf("day").toUNIX(),
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
	const [error, setError] = useState<string>();

	const [file] = useState({
		content: "",
		extension: "csv",
		name: wallet.address(),
	});

	const exporter = useMemo(() => TransactionExporter({ profile, wallet }), [profile, wallet]);

	return {
		cancelExport: () => {
			//TODO: implement.
			setStatus(ExportProgressStatus.Idle);
		},
		error,
		file,
		retry: () => {
			setStatus(ExportProgressStatus.Idle);
		},
		startExport: async (settings: ExportSettings) => {
			setStatus(ExportProgressStatus.Progress);

			const dateRange = getTimestampRange(settings.dateRange, settings.from, settings.to);

			try {
				await exporter.transactions().sync({ dateRange, type: settings.transactionType });

				setStatus(ExportProgressStatus.Success);

				file.content = await exporter.transactions().toCsv(settings);
			} catch (error) {
				setError(error.message);
				setStatus(ExportProgressStatus.Error);
				return;
			}
		},
		status,
	};
};
