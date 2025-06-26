import { Amount, AmountLabel } from "@/app/components/Amount";
import React, { JSX } from "react";
import { Contracts, DTO } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { BigNumber } from "@/app/lib/helpers";
import { UnitConverter } from "@arkecosystem/typescript-crypto";

type ExtendedTransactionData = DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData;

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

export const TransactionAmountLabel = ({
	transaction,
	profile,
}: {
	transaction: ExtendedTransactionData;
	profile?: Contracts.IProfile;
}): JSX.Element => {
	const { t } = useTranslation();

	const currency = transaction.wallet().currency();
	const returnedAmount = calculateReturnedAmount(transaction);

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
	const returnedAmount = calculateReturnedAmount(transaction);

	const getTotal = () => {
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
			return BigNumber.make(
				UnitConverter.formatUnits(transaction.wallet().validatorFee()?.toString() ?? "0", "ARK"),
			)
				.minus(transaction.total())
				.toNumber();
		}

		return transaction.total();
	};

	const getIsNegative = () => {
		if (transaction.isValidatorResignation() && "isSuccess" in transaction && transaction.isSuccess()) {
			return getTotal() < 0;
		}

		return transaction.isSent();
	};

	if (hideStyles) {
		return (
			<Amount
				showSign={false}
				showTicker={false}
				ticker={currency}
				value={getTotal()}
				isNegative={getIsNegative()}
				className="text-sm font-semibold"
				allowHideBalance
				profile={profile}
			/>
		);
	}

	return (
		<AmountLabel
			value={getTotal()}
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
	const returnedAmount = calculateReturnedAmount(transaction);
	const amount = transaction.total() - returnedAmount;

	return <Amount value={convert(amount)} ticker={exchangeCurrency || ""} allowHideBalance profile={profile} />;
};
