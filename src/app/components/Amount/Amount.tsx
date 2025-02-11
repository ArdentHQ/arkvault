import { useBalanceVisibilityContext } from "@/app/contexts/BalanceVisibility";
import { Helpers } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React from "react";

interface AmountProperties {
	ticker: string;
	value: number;
	showSign?: boolean;
	showTicker?: boolean;
	isNegative?: boolean;
	className?: string;
	allowHideBalance?: boolean;
}

const Amount: React.VFC<AmountProperties> = ({ value, ticker, showTicker = true, isNegative, showSign, className, allowHideBalance = false }) => {
	let formattedAmount = Helpers.Currency.format(value, ticker, { withTicker: showTicker });

	const { hideBalance } = useBalanceVisibilityContext();

	if (hideBalance && allowHideBalance) {
		formattedAmount = formattedAmount.replace(/[\d.,]+/g, "****");
		return <span data-testid="Amount" className={cn("whitespace-nowrap", className)}>{formattedAmount}</span>;
	}

	if (showSign) {
		formattedAmount = `${isNegative ? "-" : "+"} ${formattedAmount}`;
	}

	return (
		<span data-testid="Amount" className={cn("whitespace-nowrap", className)}>
			{formattedAmount}
		</span>
	);
};

export { Amount };
