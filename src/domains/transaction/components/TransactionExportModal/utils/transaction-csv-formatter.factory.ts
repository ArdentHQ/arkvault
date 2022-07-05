import { BigNumber } from "@ardenthq/sdk-helpers";
import { DTO, Helpers } from "@ardenthq/sdk-profiles";
import { buildTranslations } from "@/app/i18n/helpers";

const recipient = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	const { COMMON } = buildTranslations();

	if (transaction.isMultiPayment()) {
		return COMMON.MULTIPLE;
	}

	if (transaction.isTransfer()) {
		return transaction.recipient();
	}

	//TODO: Handle more transaction types.
	return COMMON.OTHER;
};

const formatAmount = (amount: number, currency: string) =>
	Helpers.Currency.format(amount, currency, {
		withTicker: true,
	});

const multiPaymentAmount = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.sender() !== transaction.wallet().address()) {
		let totalReceived = BigNumber.make(transaction.amount());

		for (const recipient of transaction.recipients()) {
			if (recipient.address !== transaction.wallet().address()) {
				totalReceived = totalReceived.minus(recipient.amount);
			}
		}

		return totalReceived.toNumber();
	}

	return transaction.amount();
};

const transactionAmount = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.isMultiPayment()) {
		return multiPaymentAmount(transaction);
	}

	return transaction.amount();
};

const transactionTotal = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.isMultiPayment()) {
		return BigNumber.make(multiPaymentAmount(transaction)).plus(transaction.fee()).toNumber();
	}

	return transaction.total();
};

const converted = (value: number, rate: BigNumber) => rate.times(value).toNumber();

export const CsvFormatter = (transaction: DTO.ExtendedConfirmedTransactionData, rate: BigNumber) => {
	const { COMMON } = buildTranslations();

	const amount = transactionAmount(transaction);
	const fee = transaction.fee();
	const total = transactionTotal(transaction);
	const exchangeCurrency = transaction.wallet().exchangeCurrency();
	const currency = transaction.wallet().currency();

	return {
		amount: () => formatAmount(amount, currency),
		convertedAmount: () => (rate ? formatAmount(converted(amount, rate), exchangeCurrency) : COMMON.NOT_AVAILABLE),
		convertedFee: () => (rate ? formatAmount(converted(fee, rate), exchangeCurrency) : COMMON.NOT_AVAILABLE),
		convertedTotal: () => (rate ? formatAmount(converted(total, rate), exchangeCurrency) : COMMON.NOT_AVAILABLE),
		datetime: () => transaction.timestamp()?.format("DD.MM.YYYY h:mm A"),
		fee: () => formatAmount(fee, currency),
		rate: () => (rate ? formatAmount(rate.toNumber(), exchangeCurrency) : COMMON.NOT_AVAILABLE),
		recipient: () => recipient(transaction),
		sender: () => transaction.sender(),
		timestamp: () => transaction.timestamp()?.toUNIX(),
		total: () => formatAmount(total, currency),
	};
};
