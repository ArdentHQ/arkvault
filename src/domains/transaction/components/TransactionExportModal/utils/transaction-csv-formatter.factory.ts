import { BigNumber } from "@ardenthq/sdk-helpers";
import { DTO } from "@ardenthq/sdk-profiles";
import { CURRENCIES } from "@ardenthq/sdk-intl";
import { buildTranslations } from "@/app/i18n/helpers";

const recipient = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	const { COMMON } = buildTranslations();

	if (transaction.isMultiPayment()) {
		return `${COMMON.MULTIPLE} (${transaction.recipients().length})`;
	}

	if (transaction.isTransfer()) {
		return transaction.recipient();
	}

	if (transaction.isVote() || transaction.isUnvote()) {
		return `${COMMON.VOTE} ${COMMON.TRANSACTION}`;
	}

	return COMMON.OTHER;
};

const transferAmount = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	if (transaction.sender() === transaction.recipient()) {
		return 0;
	}

	return transaction.amount();
};

const multiPaymentAmount = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	if (transaction.sender() === transaction.wallet().address()) {
		let totalSent = BigNumber.make(transaction.amount());

		for (const recipient of transaction.recipients()) {
			if (recipient.address === transaction.wallet().address()) {
				totalSent = totalSent.minus(recipient.amount);
			}
		}

		return totalSent.toNumber();
	}

	let totalReceived = BigNumber.ZERO;

	for (const recipient of transaction.recipients()) {
		if (recipient.address === transaction.wallet().address()) {
			totalReceived = totalReceived.plus(recipient.amount);
		}
	}

	return totalReceived.toNumber();
};

const transactionAmount = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	const amount = transaction.isMultiPayment() ? multiPaymentAmount(transaction) : transferAmount(transaction);

	if (amount > 0 && transaction.isSent()) {
		return BigNumber.make(amount).times(-1).toNumber();
	}

	return amount;
};

const transactionFee = (transaction: DTO.ExtendedConfirmedTransactionData): number => {
	if (transaction.isSent()) {
		return BigNumber.make(transaction.fee()).times(-1).toNumber();
	}

	return 0;
};

const converted = (value: number, rate: number) => BigNumber.make(value).times(rate).toNumber();

const truncate = (value: number, currency: string) => {
	const decimals = CURRENCIES[currency]?.decimals ?? 8;

	return Math.round(value * 10 ** decimals) / 10 ** decimals;
};

export const CsvFormatter = (transaction: DTO.ExtendedConfirmedTransactionData, timeFormat: string) => {
	const amount = transactionAmount(transaction);
	const fee = transactionFee(transaction);

	const total = BigNumber.make(amount).plus(fee).toNumber();

	const currency = transaction.wallet().currency();
	const exchangeCurrency = transaction.wallet().exchangeCurrency();

	const rate =
		transaction.total() === 0
			? 0
			: truncate(
					BigNumber.make(transaction.convertedTotal()).divide(transaction.total()).toNumber(),
					exchangeCurrency,
				);

	return {
		amount: () => truncate(amount, currency),
		convertedAmount: () => truncate(converted(amount, rate), exchangeCurrency),
		convertedFee: () => (fee === 0 ? 0 : truncate(converted(fee, rate), exchangeCurrency)),
		convertedTotal: () => truncate(converted(total, rate), exchangeCurrency),
		datetime: () => transaction.timestamp()?.format(`DD.MM.YYYY ${timeFormat}`),
		fee: () => fee,
		rate: () => rate,
		recipient: () => recipient(transaction),
		sender: () => transaction.sender(),
		timestamp: () => transaction.timestamp()?.toUNIX(),
		total: () => truncate(total, currency),
	};
};
