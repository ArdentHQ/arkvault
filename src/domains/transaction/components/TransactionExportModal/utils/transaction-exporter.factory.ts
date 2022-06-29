import { Contracts, DTO, Helpers } from "@ardenthq/sdk-profiles";
import { DateTime } from "@ardenthq/sdk-intl";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { convertToCsv } from "./transaction-to-csv-converter";

interface TransactionExporterFetchProperties {
	type: "all" | "received" | "sent";
	from?: DateTime;
	to?: DateTime;
	cursor?: number;
}

export const TransactionExporter = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const limit = 100;

	let transactions: DTO.ExtendedConfirmedTransactionData[] = [];

	const sync = async ({ type = "all", from, to, cursor = 1 }: TransactionExporterFetchProperties) => {
		// Clear cache.
		if (cursor === 1) {
			transactions = [];
		}

		const page = await wallet.transactionIndex()[type]({ cursor, limit });

		transactions = [...transactions, ...page.items()];
		cursor = cursor + 1;

		// Last page.
		// TODO: Not relying on totalCount because it is an estimate
		//        and is not giving accurate pagination info. Address this issue after initial implementation.
		if (page.items().length < limit) {
			return;
		}

		return sync({ type, from, to, cursor });
	};

	return {
		transactions: () => ({
			sync,
			items: () => transactions,
			toCsv: (settings: CsvSettings) => convertToCsv(transactions, settings),
		}),
	};
};
