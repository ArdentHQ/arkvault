import { BigNumber } from "@/app/lib/helpers";
import { CURRENCIES } from "@/app/lib/intl";
import { DTO } from "@/app/lib/profiles";
import { buildTranslations } from "@/app/i18n/helpers";

const recipient = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	const { COMMON } = buildTranslations();

	if (transaction.isMultiPayment()) {
		return `${COMMON.MULTIPLE} (${transaction.recipients().length})`;
	}

	if (transaction.isTransfer()) {
		return transaction.to();
	}

	if (transaction.isVote() || transaction.isUnvote()) {
		return `${COMMON.VOTE} ${COMMON.TRANSACTION}`;
	}

	return COMMON.OTHER;
};

const transferAmount = (transaction: DTO.ExtendedConfirmedTransactionData): BigNumber => {
	if (transaction.from() === transaction.to()) {
		return BigNumber.ZERO;
	}

	return transaction.value();
};

const multiPaymentAmount = (transaction: DTO.ExtendedConfirmedTransactionData): BigNumber => {
	if (transaction.from() === transaction.wallet().address()) {
		let totalSent = BigNumber.make(transaction.value());

		for (const recipient of transaction.recipients()) {
			if (recipient.address === transaction.wallet().address()) {
				totalSent = totalSent.minus(recipient.amount);
			}
		}

		return totalSent;
	}

	let totalReceived = BigNumber.ZERO;

	for (const recipient of transaction.recipients()) {
		if (recipient.address === transaction.wallet().address()) {
			totalReceived = totalReceived.plus(recipient.amount);
		}
	}

	return totalReceived;
};

const transactionAmount = (transaction: DTO.ExtendedConfirmedTransactionData): BigNumber => {
	const amount = transaction.isMultiPayment() ? multiPaymentAmount(transaction) : transferAmount(transaction);

	if (amount.isGreaterThan(0) && transaction.isSent()) {
		return amount.times(-1);
	}

	return amount;
};

const transactionFee = (transaction: DTO.ExtendedConfirmedTransactionData): BigNumber => {
	if (transaction.isSent()) {
		return transaction.fee().times(-1);
	}

	return BigNumber.ZERO;
};

const converted = (value: BigNumber, rate: BigNumber) => value.times(rate);

const truncate = (value: BigNumber|number, currency: string) => {
	const decimals = CURRENCIES[currency]?.decimals ?? 18;

	return BigNumber.make(value, decimals);
};

export const CsvFormatter = (transaction: DTO.ExtendedConfirmedTransactionData, timeFormat: string) => {
	const amount = transactionAmount(transaction);
	const fee = transactionFee(transaction);

	const total = BigNumber.make(amount).plus(fee);

	const currency = transaction.wallet().currency();
	const exchangeCurrency = transaction.wallet().exchangeCurrency();

	const rate =
		transaction.total().isEqualTo(0)
			? BigNumber.ZERO
			: truncate(
					BigNumber.make(transaction.convertedTotal()).divide(transaction.total()),
					exchangeCurrency,
				);

	return {
		amount: () => truncate(amount, currency).toString(),
		convertedAmount: () => truncate(converted(amount, rate), exchangeCurrency).toString(),
		convertedFee: () => (fee.isEqualTo(0) ? 0 : truncate(converted(fee, rate), exchangeCurrency).toString()),
		convertedTotal: () => truncate(converted(total, rate), exchangeCurrency).toString(),
		datetime: () => transaction.timestamp()?.format(`DD.MM.YYYY ${timeFormat}`),
		fee: () => fee.toString(),
		rate: () => rate.toString(),
		recipient: () => recipient(transaction),
		sender: () => transaction.from(),
		timestamp: () => transaction.timestamp()?.toUNIX(),
		total: () => truncate(total, currency).toString(),
	};
};
