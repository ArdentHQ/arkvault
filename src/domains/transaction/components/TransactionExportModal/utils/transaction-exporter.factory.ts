import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { Services } from "@ardenthq/sdk";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { convertToCsv } from "./transaction-to-csv-converter";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { assertString } from "@/utils/assertions";

interface TransactionExporterFetchProperties {
	type: "all" | "received" | "sent";
	dateRange?: Services.RangeCriteria;
	reset?: boolean;
}

const filterTransactions = (transactions: DTO.ExtendedConfirmedTransactionData[]) =>
	transactions.filter((transaction) => {
		if (transaction.isTransfer()) {
			return transaction.sender() !== transaction.recipient();
		}

		if (transaction.isMultiPayment()) {
			let amount = BigNumber.make(transaction.amount());

			for (const recipient of transaction.recipients()) {
				if (transaction.sender() === recipient.address) {
					amount = amount.minus(recipient.amount);
				}
			}

			return !amount.isZero();
		}

		return false;
	});

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

	let count = 0;

	assertString(exchangeCurrency);
	assertString(timeFormat);

	let requestedSyncAbort = false;

	let transactions: DTO.ExtendedConfirmedTransactionData[] = [];

	const sync = async ({
		type = "all",
		dateRange,
		reset = true,
	}: TransactionExporterFetchProperties): Promise<number | undefined> => {
		// Clear cache.
		if (reset) {
			transactions = [];
			requestedSyncAbort = false;
		}

		if (requestedSyncAbort) {
			return;
		}

		const page = await wallet.transactionIndex()[type]({
			limit,
			orderBy: "timestamp:desc,sequence:desc",
			timestamp: dateRange,
		});

		const fetchedTransactions = page.items();
		const fetchedTransactionsCount = fetchedTransactions.length;

		transactions.push(...fetchedTransactions);

		count = transactions.length;

		// Last page.
		// TODO: Not relying on totalCount because it is an estimate
		//        and is not giving accurate pagination info. Address this issue after initial implementation.
		if (fetchedTransactionsCount < limit) {
			if (type === "received") {
				transactions = filterTransactions(transactions);
			}
			return transactions.length;
		}

		let nextDateRange: Services.RangeCriteria = {
			to: fetchedTransactions[fetchedTransactionsCount - 1].timestamp()?.subMillisecond().toUNIX(),
		};

		if (dateRange?.from) {
			nextDateRange = {
				...nextDateRange,
				from: dateRange.from,
			};
		}

		return sync({ dateRange: nextDateRange, reset: false, type });
	};

	return {
		transactions: () => ({
			abortSync: () => (requestedSyncAbort = true),
			count: () => count,
			items: () => transactions,
			sync,
			toCsv: (settings: CsvSettings) => convertToCsv(transactions, settings, exchangeCurrency, timeFormat),
		}),
	};
};
