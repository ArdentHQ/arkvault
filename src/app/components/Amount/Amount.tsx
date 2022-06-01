import { Helpers } from "@payvo/sdk-profiles";
import cn from "classnames";
import React from "react";

interface AmountProperties {
	ticker: string;
	value: number;
	showSign?: boolean;
	showTicker?: boolean;
	isNegative?: boolean;
	className?: string;
}

const Amount: React.VFC<AmountProperties> = ({ value, ticker, showTicker = true, isNegative, showSign, className }) => {
	let formattedAmount = Helpers.Currency.format(value, ticker, { withTicker: showTicker });

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
