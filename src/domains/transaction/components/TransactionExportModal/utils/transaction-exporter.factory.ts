import { Contracts, DTO } from "@/app/lib/profiles";

import { BigNumber } from "@/app/lib/helpers";
import { CsvSettings } from "@/domains/transaction/components/TransactionExportModal";
import { Services } from "@/app/lib/sdk";
import { assertString } from "@/utils/assertions";
import { convertToCsv } from "./transaction-to-csv-converter";
import { AggregateQuery } from "@/app/lib/profiles/transaction.aggregate.contract";

interface TransactionExporterFetchProperties {
	type: "all" | "received" | "sent";
	dateRange?: Services.RangeCriteria;
	reset?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const filterTransactions = (transactions: DTO.ExtendedConfirmedTransactionData[]) =>
	transactions.filter((transaction) => {
		if (transaction.isTransfer()) {
			return transaction.from() !== transaction.to();
		}

		if (transaction.isMultiPayment()) {
			let amount = BigNumber.make(transaction.value());

			for (const recipient of transaction.recipients()) {
				if (transaction.from() === recipient.address) {
					amount = amount.minus(recipient.amount);
				}
			}

			return !amount.isZero();
		}

		return false;
	});

interface ExtendedAggregateQuery extends AggregateQuery {
	timestamp: Services.RangeCriteria | undefined;
	senderId?: string;
	recipientId?: string;
}

export const TransactionExporter = ({
	profile,
	wallets,
	limit = 100,
}: {
	profile: Contracts.IProfile;
	wallets: Contracts.IReadWriteWallet[];
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

		const queryParameters: ExtendedAggregateQuery = {
			limit,
			orderBy: "timestamp:desc,sequence:desc",
			timestamp: dateRange,
		};

		if (type === "all") {
			queryParameters.identifiers = wallets.map((wallet) => ({
				type: "address",
				value: wallet.address(),
			}));
		}

		if (type === "sent") {
			queryParameters.senderId = wallets.map((wallet) => wallet.address()).join(",");
		}

		if (type === "received") {
			queryParameters.recipientId = wallets.map((wallet) => wallet.address()).join(",");
		}

		const page = await profile.transactionAggregate()[type](queryParameters);

		const fetchedTransactions = page.items();
		const fetchedTransactionsCount = fetchedTransactions.length;

		transactions.push(...fetchedTransactions);

		count = transactions.length;

		// Last page.
		// TODO: Not relying on totalCount because it is an estimate
		//        and is not giving accurate pagination info. Address this issue after initial implementation.
		if (fetchedTransactionsCount < limit) {
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
