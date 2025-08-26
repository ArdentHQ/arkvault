import { Amount, AmountLabel } from "@/app/components/Amount";
import React, { JSX, useEffect, useRef, useState } from "react";
import { Contracts } from "@/app/lib/profiles";
import { useTranslation } from "react-i18next";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { ExtendedTransactionData, useTransactionTotal } from "@/domains/transaction/hooks/use-transaction-total";
import { Tooltip } from "@/app/components/Tooltip";
import { Label, LabelProperties } from "@/app/components/Label";

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

export const TransactionTypeLabel = ({
	tooltipContent,
	children,
	...props
}: {
	tooltipContent?: string;
	children: React.ReactNode;
} & LabelProperties): JSX.Element => {
	const [isTruncated, setIsTruncated] = useState(false);
	const textRef = useRef<HTMLSpanElement>(null);

	useEffect(() => {
		const checkTruncation = () => {
			if (textRef.current) {
				const isOverflowing = textRef.current.scrollWidth > textRef.current.clientWidth;
				setIsTruncated(isOverflowing);
			}
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
			className="max-w-20 rounded px-1 py-[3px] lg:max-w-40 dark:border"
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
