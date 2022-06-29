import { BigNumber } from "@ardenthq/sdk-helpers";
import { DTO, Helpers } from "@ardenthq/sdk-profiles";

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

export const AmountFormatter = (transaction: DTO.ExtendedConfirmedTransactionData) => ({
	amount: () => transactionAmount(transaction),
	fee: () => formatAmount(transaction.fee(), transaction),
	total: () => transactionTotal(transaction),
});
