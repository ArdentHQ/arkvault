import { Contracts } from "@ardenthq/sdk-profiles";
import { useState } from "react";
import { ExportProgressStatus, ExportSettings } from "@/domains/transaction/components/TransactionExportModal";

export const useTransactionExport = ({
	wallet,
	initialStatus,
}: {
	wallet: Contracts.IReadWriteWallet;
	initialStatus: ExportProgressStatus;
}) => {
	const [status, setStatus] = useState<ExportProgressStatus>(initialStatus);
	const [error] = useState<string>();

	const [file] = useState({
		content: "",
		extension: "csv",
		//TODO: Default export name?
		name: `wallet-${wallet.address()}-transactions`,
	});

	return {
		file,
		cancelExport: () => {
			//TODO: implement.
			setStatus(ExportProgressStatus.Idle);
		},
		startExport: (settings: ExportSettings) => {
			console.log({ settings });
			//TODO: Aggregate transactions and show progress.
			setStatus(ExportProgressStatus.Progress);

			//TODO: Convert fetched transaction objects to csv
		},
		retry: () => {
			setStatus(ExportProgressStatus.Idle);
		},
		status,
		error,
	};
};
