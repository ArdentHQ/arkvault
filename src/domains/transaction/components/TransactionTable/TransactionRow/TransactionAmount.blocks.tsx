import { Amount, AmountLabel } from "@/app/components/Amount";
import React, { JSX, useEffect, useRef, useState } from "react";
import { Contracts, Helpers } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { ExtendedTransactionData, useTransactionTotal } from "@/domains/transaction/hooks/use-transaction-total";
import { Tooltip } from "@/app/components/Tooltip";
import { Label, LabelProperties } from "@/app/components/Label";
import { BigNumber } from "@/app/lib/helpers";

export const isOverflowing = (element?: HTMLSpanElement | null) => {
	if (element) {
		return element.scrollWidth > element.clientWidth;
	}
	return false;
};

export const TransactionAmountLabel = ({
	transaction,
	profile,
	allowHideBalance,
}: {
	transaction: ExtendedTransactionData;
	profile?: Contracts.IProfile;
	allowHideBalance?: boolean;
}): JSX.Element => {
	const { t } = useTranslation();

	const transactionToken = "token" in transaction ? transaction.token() : undefined;

	const displaySymbol = transactionToken?.token().displaySymbol() ?? transaction.wallet().currency();
	const fullSymbol = transactionToken?.token().symbol() ?? transaction.wallet().currency();

	const value = transactionToken ? transactionToken.value() : transaction.value();
	const { returnedAmount } = useTransactionTotal(transaction);

	const tooltipContent = Helpers.Currency.format(BigNumber.make(value).toString(), fullSymbol, {
		withTicker: true,
	});

	return (
		<AmountLabel
			value={value}
			isNegative={transaction.isSent()}
			ticker={displaySymbol}
			hideSign={transaction.isReturn()}
			isCompact
			hint={
				BigNumber.make(returnedAmount).isGreaterThan(0)
					? t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: returnedAmount, currency: displaySymbol })
					: undefined
			}
			className="h-[21px] rounded dark:border"
			allowHideBalance={allowHideBalance}
			profile={profile}
			showCompactFormat
			tooltipContent={tooltipContent}
		/>
	);
};

export const TransactionTotalLabel = ({
	transaction,
	hideStyles = false,
	profile,
	decimals,
	showTicker,
}: {
	transaction: ExtendedTransactionData;
	hideStyles?: boolean;
	profile?: Contracts.IProfile;
	decimals?: number;
	showTicker?: boolean;
}): JSX.Element => {
	const { t } = useTranslation();

	const token = transaction.token();

	const displaySymbol = token?.token().displaySymbol() ?? transaction.wallet().currency();
	const fullSymbol = token?.token().symbol() ?? transaction.wallet().currency();

	const { returnedAmount, total } = useTransactionTotal(transaction);

	const getIsNegative = () => {
		if (transaction.isValidatorResignation() && "isSuccess" in transaction && transaction.isSuccess()) {
			return total.isNegative();
		}

		return transaction.isSent();
	};

	const tooltipContent = Helpers.Currency.format(BigNumber.make(total).toString(), fullSymbol, {
		withTicker: true,
	});

	if (hideStyles) {
		return (
			<Amount
				decimals={decimals}
				showSign={false}
				showTicker={showTicker}
				ticker={displaySymbol}
				value={total}
				isNegative={getIsNegative()}
				className="text-sm font-semibold"
				allowHideBalance
				profile={profile}
				showCompactFormat
				tooltipContent={tooltipContent}
			/>
		);
	}

	return (
		<AmountLabel
			decimals={decimals}
			value={total}
			isNegative={getIsNegative()}
			ticker={displaySymbol}
			hideSign={transaction.isReturn()}
			isCompact
			hint={
				returnedAmount.isGreaterThan(0)
					? t("TRANSACTION.HINT_AMOUNT_EXCLUDING", { amount: returnedAmount, currency: displaySymbol })
					: undefined
			}
			className="h-[21px] rounded dark:border"
			allowHideBalance
			profile={profile}
			showCompactFormat
			showTicker={showTicker}
			tooltipContent={tooltipContent}
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

	const amount = total.minus(returnedAmount);

	return <Amount value={convert(amount)} ticker={exchangeCurrency || ""} allowHideBalance profile={profile} />;
};

export const TransactionTypeLabel = ({
	tooltipContent,
	children,
	...props
}: {
	tooltipContent?: string;
	children: React.ReactNode;
} & LabelProperties): JSX.Element => {
	const [isTruncated, setIsTruncated] = useState(false);
	const textRef = useRef<HTMLSpanElement | null>(null);

	useEffect(() => {
		const checkTruncation = () => {
			setIsTruncated(isOverflowing(textRef.current));
		};

		checkTruncation();

		window.addEventListener("resize", checkTruncation);

		return () => {
			window.removeEventListener("resize", checkTruncation);
		};
	}, [children]);

	const labelContent = (
		<Label
			{...props}
			className="max-w-20 rounded px-1 py-[3px] dark:border lg:max-w-40"
			data-testid="TransactionRow__type"
		>
			<span ref={textRef} className="block truncate whitespace-nowrap">
				{children}
			</span>
		</Label>
	);

	if (isTruncated && tooltipContent) {
		return <Tooltip content={tooltipContent}>{labelContent}</Tooltip>;
	}

	return labelContent;
};
