import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { Services } from "@ardenthq/sdk";
import { convertToCsv } from "./transaction-to-csv-converter";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { assertString } from "@/utils/assertions";

interface TransactionExporterFetchProperties {
	type: "all" | "received" | "sent";
	dateRange?: Services.RangeCriteria;
	cursor?: number;
}

export const TransactionExporter = ({
	profile,
	wallet,
	limit = 100,
}: {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	limit?: number;
}) => {
	const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
	const timeFormat = profile.settings().get<string>(Contracts.ProfileSetting.TimeFormat);

	assertString(exchangeCurrency);
	assertString(timeFormat);

	let requestedSyncAbort = false;

	let transactions: DTO.ExtendedConfirmedTransactionData[] = [];

	const sync = async ({
		type = "all",
		dateRange,
		cursor = 1,
	}: TransactionExporterFetchProperties): Promise<number | undefined> => {
		// Clear cache.
		if (cursor === 1) {
			transactions = [];
			requestedSyncAbort = false;
		}

		if (requestedSyncAbort) {
			return;
		}

		const page = await wallet.transactionIndex()[type]({ cursor, limit, timestamp: dateRange });

		transactions.push(...page.items());
		cursor = cursor + 1;

		// Last page.
		// TODO: Not relying on totalCount because it is an estimate
		//        and is not giving accurate pagination info. Address this issue after initial implementation.
		if (page.items().length < limit) {
			return transactions.length;
		}

		return sync({ cursor, dateRange, type });
	};

	return {
		transactions: () => ({
			abortSync: () => (requestedSyncAbort = true),
			items: () => transactions,
			sync,
			toCsv: (settings: CsvSettings) => convertToCsv(transactions, settings, exchangeCurrency, timeFormat),
		}),
	};
};
