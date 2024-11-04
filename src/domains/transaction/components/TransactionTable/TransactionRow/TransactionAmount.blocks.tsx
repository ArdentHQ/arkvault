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

	// should return 0 as we don't want to show hint
	if(transaction.isReturn()) {
		return returnedAmount;
	}

	for (const recipient of transaction.recipients().values()) {
		if (transaction.sender() === recipient.address) {
			returnedAmount += recipient.amount;
		}
	}

	if(transaction.id() === "b22574277ad0d83b3252483a2f47a1c80a7bfaee1adad6ee0119764ef8d949a2") {
		console.log({
			sender: transaction.sender(),
			isReturn: transaction.isReturn(),
			recipients: transaction.recipients(),
			total: transaction.total(),
			amount: transaction.amount(),
			returnedAmount,
		})
	}
	return returnedAmount;
};

export const TransactionAmountLabel = ({ transaction }: { transaction: ExtendedTransactionData }): JSX.Element => {
	const { t } = useTranslation();

	const currency = transaction.wallet().currency();

	const returnedAmount = calculateReturnedAmount(transaction);
	const amount = transaction.total() - returnedAmount;

	const usesMultiSignature = "usesMultiSignature" in transaction ? transaction.usesMultiSignature() : false;
	const isMusigTransfer = [usesMultiSignature, !transaction.isMultiSignatureRegistration()].every(Boolean);

	const isNegative = [isMusigTransfer, transaction.isSent()].some(Boolean);

	return (
		<AmountLabel
			value={amount}
			isNegative={isNegative}
			ticker={transaction.wallet().currency()}
			hideSign={transaction.isReturn()}
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
