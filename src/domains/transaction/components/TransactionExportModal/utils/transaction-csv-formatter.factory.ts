import { BigNumber } from "@ardenthq/sdk-helpers";
import { DTO, Helpers } from "@ardenthq/sdk-profiles";
import { buildTranslations } from "@/app/i18n/helpers";

const formatAmount = (amount: number, transaction: DTO.ExtendedConfirmedTransactionData) =>
	Helpers.Currency.format(amount, transaction.wallet().exchangeCurrency(), {
		withTicker: false,
	});

const multiPaymentAmount = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.isReceived()) {
		let totalReceived = BigNumber.make(transaction.amount());

		for (const recipient of transaction.recipients()) {
			if (recipient.address === transaction.wallet().address()) {
				totalReceived.minus(recipient.amount);
			}
		}

		return formatAmount(totalReceived.toNumber(), transaction);
	}

	return formatAmount(transaction.amount(), transaction);
};

const transactionAmount = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.isMultiPayment()) {
		return multiPaymentAmount(transaction);
	}

	return formatAmount(transaction.amount(), transaction);
};

const transactionTotal = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.isMultiPayment()) {
		return BigNumber.make(multiPaymentAmount(transaction)).plus(transaction.fee());
	}

	return formatAmount(transaction.total(), transaction);
};

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

const datetime = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	const dateTimeFormat = "DD.MM.YYYY h:mm A";
	return transaction.timestamp()?.format(dateTimeFormat);
};

export const CsvFormatter = (transaction: DTO.ExtendedConfirmedTransactionData) => ({
	recipient: () => recipient(transaction),
	amount: () => transactionAmount(transaction),
	fee: () => formatAmount(transaction.fee(), transaction),
	total: () => transactionTotal(transaction),
	datetime: () => datetime(transaction),
	timestamp: () => transaction.timestamp()?.toUNIX(),
	sender: () => transaction.sender(),
});
