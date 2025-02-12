import { Amount, AmountLabel } from "@/app/components/Amount";
import React from "react";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";

type ExtendedTransactionData = DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;

// This function determines if an unconfirmed musig transaction is a returning transaction.
// It uses `sender()` and `recipient()` methods to do checks instead of using the active
// wallet. It is because unconfirmed transactions should be reflected from the sender perspective.
const isReturnUnconfirmedMusigTransaction = (transaction: ExtendedTransactionData): boolean => {
	const usesMultiSignature = "usesMultiSignature" in transaction ? transaction.usesMultiSignature() : false;

	const isMusig = [usesMultiSignature, !transaction.isConfirmed(), !transaction.isMultiSignatureRegistration()].every(
		Boolean,
	);

	return isMusig ? transaction.sender() === transaction.recipient() : false;
};

const calculateReturnedAmount = function (transaction: ExtendedTransactionData): number {
	let returnedAmount = 0;

	if (!transaction.isMultiPayment()) {
		return returnedAmount;
	}

	// should return 0 as we don't want to show a hint
	if (transaction.isReturn() || isReturnUnconfirmedMusigTransaction(transaction)) {
		return returnedAmount;
	}

	for (const recipient of transaction.recipients().values()) {
		if (transaction.isSent() && transaction.sender() === recipient.address) {
			returnedAmount += recipient.amount;
		}
	}

	return returnedAmount;
};

export const TransactionAmountLabel = ({ transaction, profile }: { transaction: ExtendedTransactionData; profile?: Contracts.IProfile }): JSX.Element => {
	const { t } = useTranslation();

	const currency = transaction.wallet().currency();
	const returnedAmount = calculateReturnedAmount(transaction);

	return (
		<AmountLabel
			value={transaction.amount()}
			isNegative={transaction.isSent()}
			ticker={currency}
			hideSign={transaction.isReturn()}
			isCompact
			hint={
				returnedAmount
					? t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: returnedAmount, currency })
					: undefined
			}
			className="h-[21px] rounded dark:border"
			allowHideBalance
			profile={profile}
		/>
	);
};

export const TransactionTotalLabel = ({
	transaction,
	hideStyles = false,
	profile,
}: {
	transaction: ExtendedTransactionData;
	hideStyles?: boolean;
	profile?: Contracts.IProfile;
}): JSX.Element => {
	const { t } = useTranslation();

	const currency = transaction.wallet().currency();
	const returnedAmount = calculateReturnedAmount(transaction);

	if (hideStyles) {
		return (
			<Amount
				showSign={false}
				showTicker={false}
				ticker={currency}
				value={transaction.total()}
				isNegative={transaction.isSent()}
				className="text-sm font-semibold"
				allowHideBalance
				profile={profile}
			/>
		);
	}

	return (
		<AmountLabel
			value={transaction.total()}
			isNegative={transaction.isSent()}
			ticker={currency}
			hideSign={transaction.isReturn()}
			isCompact
			hint={
				returnedAmount
					? t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: returnedAmount, currency })
					: undefined
			}
			className="h-[21px] rounded dark:border"
			allowHideBalance
			profile={profile}
		/>
	);
};

export const TransactionFiatAmount = ({
	transaction,
	exchangeCurrency,
	profile,
}: {
	transaction: ExtendedTransactionData;
	exchangeCurrency?: string;
	profile?: Contracts.IProfile;
}): JSX.Element => {
	const currency = transaction.wallet().currency();
	const { convert } = useExchangeRate({ exchangeTicker: exchangeCurrency, ticker: currency });
	const returnedAmount = calculateReturnedAmount(transaction);
	const amount = transaction.total() - returnedAmount;

	return <Amount value={convert(amount)} ticker={exchangeCurrency || ""} allowHideBalance profile={profile} />;
};
