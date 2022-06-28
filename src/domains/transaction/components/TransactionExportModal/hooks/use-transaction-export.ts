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
		name: `wallet-${wallet.address()}-transactions`,
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
			setStatus(ExportProgressStatus.Progress);

			try {
				// TODO: Improve filter (tx method, timestamps).
				await exporter.transactions().sync({ type: "all" });

				setStatus(ExportProgressStatus.Success);

				// TODO: Implement csv export
				file.content = await exporter.transactions().toCsv(settings);
			} catch (error) {
				setError(error.message);
				return;
			}
		},
		status,
	};
};
