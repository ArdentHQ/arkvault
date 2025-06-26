import { Amount, AmountLabel } from "@/app/components/Amount";
import React, { JSX } from "react";
import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { ExtendedTransactionData, useTransactionTotal } from "@/domains/transaction/hooks/use-transaction-total";

export const TransactionAmountLabel = ({
	transaction,
	profile,
}: {
	transaction: ExtendedTransactionData;
	profile?: Contracts.IProfile;
}): JSX.Element => {
	const { t } = useTranslation();

	const currency = transaction.wallet().currency();

	const { returnedAmount } = useTransactionTotal(transaction);

	return (
		<AmountLabel
			value={transaction.value()}
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

	const { returnedAmount, total } = useTransactionTotal(transaction);

	const getIsNegative = () => {
		if (transaction.isValidatorResignation() && "isSuccess" in transaction && transaction.isSuccess()) {
			return total < 0;
		}

		return transaction.isSent();
	};

	if (hideStyles) {
		return (
			<Amount
				showSign={false}
				showTicker={false}
				ticker={currency}
				value={total}
				isNegative={getIsNegative()}
				className="text-sm font-semibold"
				allowHideBalance
				profile={profile}
			/>
		);
	}

	return (
		<AmountLabel
			value={total}
			isNegative={getIsNegative()}
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
	const { convert } = useExchangeRate({
		exchangeTicker: exchangeCurrency,
		profile: transaction.wallet().profile(),
		ticker: currency,
	});

	const { returnedAmount, total } = useTransactionTotal(transaction);

	const amount = total - returnedAmount;

	return <Amount value={convert(amount)} ticker={exchangeCurrency || ""} allowHideBalance profile={profile} />;
};
