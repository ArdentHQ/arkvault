import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo, useState } from "react";
import { ExportProgressStatus, ExportSettings } from "@/domains/transaction/components/TransactionExportModal";
import { TransactionExporter } from "@/domains/transaction/components/TransactionExportModal/utils/transaction-exporter.factory";

export const useTransactionExport = ({
	wallet,
	initialStatus,
}: {
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

	const exporter = useMemo(() => TransactionExporter({ wallet }), [wallet]);

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
			console.log({ settings });
			setStatus(ExportProgressStatus.Progress);

			try {
				await exporter.transactions().sync({ type: settings.transactionType });

				setStatus(ExportProgressStatus.Success);

				file.content = await exporter.transactions().toCsv(settings);
				console.log({ content: file.content });
			} catch (error) {
				setError(error.message);
				setStatus(ExportProgressStatus.Error);
				return;
			}
		},
		status,
	};
};
