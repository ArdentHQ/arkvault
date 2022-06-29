import { DTO, Helpers } from "@ardenthq/sdk-profiles";

const formatAmount = (amount: number, transaction: DTO.ExtendedConfirmedTransactionData) =>
	Helpers.Currency.format(amount, transaction.wallet().exchangeCurrency(), {
		withTicker: false,
	});

const multiPaymentAmount = (transaction: DTO.ExtendedConfirmedTransactionData) =>
	// TODO: Handle multiplayment amount calculation.
	formatAmount(transaction.amount(), transaction);
const transactionAmount = (transaction: DTO.ExtendedConfirmedTransactionData) => {
	if (transaction.isMultiPayment()) {
		return multiPaymentAmount(transaction);
	}

	return formatAmount(transaction.amount(), transaction);
};

export const AmountFormatter = (transaction: DTO.ExtendedConfirmedTransactionData) => ({
	amount: () => transactionAmount(transaction),
	fee: () => formatAmount(transaction.fee(), transaction),
	total: () => formatAmount(transaction.total(), transaction),
});
