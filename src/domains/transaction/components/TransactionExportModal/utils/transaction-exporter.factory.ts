import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { convertToCsv } from "./transaction-to-csv-converter";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";

interface TransactionExporterFetchProperties {
	type: "all" | "received" | "sent";
	from?: number;
	to?: number;
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

		// TODO: include timestamps in query
		const page = await wallet.transactionIndex()[type]({ cursor, limit });

		transactions.push(...page.items());
		cursor = cursor + 1;

		// Last page.
		// TODO: Not relying on totalCount because it is an estimate
		//        and is not giving accurate pagination info. Address this issue after initial implementation.
		if (page.items().length < limit) {
			return;
		}

		return sync({ cursor, from, to, type });
	};

	return {
		transactions: () => ({
			items: () => transactions,
			sync,
			toCsv: (settings: CsvSettings) => convertToCsv(transactions, settings),
		}),
	};
};
