import { DTO } from "@/app/lib/profiles";
import { BigNumber } from "@/app/lib/helpers";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

export type ExtendedTransactionData = DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;

const calculateReturnedAmount = function (transaction: ExtendedTransactionData): number {
	let returnedAmount = 0;

	if (!transaction.isMultiPayment()) {
		return returnedAmount;
	}

	// should return 0 as we don't want to show a hint
	if (transaction.isReturn()) {
		return returnedAmount;
	}

	for (const recipient of transaction.recipients().values()) {
		if (transaction.isSent() && transaction.from() === recipient.address) {
			returnedAmount += recipient.amount;
		}
	}

	return returnedAmount;
};

const calculateTotal = (transaction: ExtendedTransactionData) => {
	if (transaction.isValidatorRegistration()) {
		if ("isSuccess" in transaction && transaction.isSuccess()) {
			return transaction.total();
		}

		return BigNumber.make(transaction.total())
			.minus(UnitConverter.formatUnits(transaction.wallet().validatorFee()?.toString() ?? "0", "ARK"))
			.toNumber();
	}

	// For validator resignation, we need to manually add the fee to the total
	if (transaction.isValidatorResignation() && "isSuccess" in transaction && transaction.isSuccess()) {
		return BigNumber.make(UnitConverter.formatUnits(transaction.wallet().validatorFee()?.toString() ?? "0", "ARK"))
			.minus(transaction.total())
			.toNumber();
	}

	return transaction.total();
};

export const useTransactionTotal = (
	transaction: ExtendedTransactionData,
): { total: number; returnedAmount: number } => ({
	returnedAmount: calculateReturnedAmount(transaction),
	total: calculateTotal(transaction),
});
