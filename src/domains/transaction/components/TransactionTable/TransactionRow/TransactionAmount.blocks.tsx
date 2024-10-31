import { Amount, AmountLabel } from "@/app/components/Amount";
import React from "react";
import { DTO } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";

type ExtendedTransactionData = DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;

const calculateReturnedAmount = function (transaction: ExtendedTransactionData): number {
	let returnedAmount = 0;

	if (!transaction.isMultiPayment()) {
		return returnedAmount;
	}
	console.log(transaction.recipients(), transaction.id(), transaction.isReturn())

	for (const recipient of transaction.recipients().values()) {
		if (transaction.isReturn() && transaction.sender() === recipient.address) {
			returnedAmount += recipient.amount;
		}
	}

	return returnedAmount;
};

export const TransactionAmountLabel = ({ transaction }: { transaction: ExtendedTransactionData }): JSX.Element => {
	const { t } = useTranslation();

	const currency = transaction.wallet().currency();

	const returnedAmount = calculateReturnedAmount(transaction);
	const amount = transaction.total() - returnedAmount;

	const isMusigTransfer = [transaction?.usesMultiSignature(), !transaction.isMultiSignatureRegistration()].every(
		Boolean,
	);

	const isNegative = [isMusigTransfer, transaction.isSent()].some(Boolean);

	return (
		<AmountLabel
			value={amount}
			isNegative={isNegative}
			ticker={transaction.wallet().currency()}
			hideSign={transaction.isTransfer() && transaction.sender() === transaction.recipient()}
			isCompact
			hint={
				returnedAmount
					? t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: returnedAmount, currency })
					: undefined
			}
			className="h-[21px] rounded dark:border"
		/>
	);
};

export const TransactionFiatAmount = ({
	transaction,
	exchangeCurrency,
}: {
	transaction: ExtendedTransactionData;
	exchangeCurrency?: string;
}): JSX.Element => {
	const currency = transaction.wallet().currency();
	const { convert } = useExchangeRate({ exchangeTicker: exchangeCurrency, ticker: currency });
	const returnedAmount = calculateReturnedAmount(transaction);
	const amount = transaction.total() - returnedAmount;

	return <Amount value={convert(amount)} ticker={exchangeCurrency || ""} />;
};
