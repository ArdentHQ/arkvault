import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { Contracts, Helpers } from "@/app/lib/profiles";
import cn from "classnames";
import React from "react";

interface AmountProperties {
	ticker: string;
	value: number;
	showSign?: boolean;
	showTicker?: boolean;
	isNegative?: boolean;
	allowHideBalance?: boolean;
	profile?: Contracts.IProfile;
}

const useFormatAmount = ({
	value,
	ticker,
	showTicker = true,
	showSign = false,
	isNegative = false,
	allowHideBalance = false,
	profile,
}: AmountProperties): string => {
	let formattedAmount = Helpers.Currency.format(value, ticker, { withTicker: showTicker });

	const { hideBalance } = useBalanceVisibility({ profile });

	if (hideBalance && allowHideBalance) {
		return formattedAmount.replaceAll(/[\d,.]+/g, "****");
	}

	if (showSign) {
		return `${isNegative ? "-" : "+"} ${formattedAmount}`;
	}

	return formattedAmount;
};

const Amount = ({
	className,
	value,
	ticker,
	showTicker = true,
	showSign = false,
	isNegative = false,
	allowHideBalance = false,
	profile,
	...properties
}: AmountProperties & React.HTMLAttributes<HTMLSpanElement>) => {
	const formattedAmount = useFormatAmount({
		value,
		ticker,
		showTicker,
		showSign,
		isNegative,
		allowHideBalance,
		profile,
	});

	return (
		<span data-testid="Amount" className={cn("whitespace-nowrap", className)} {...properties}>
			{formattedAmount}
		</span>
	);
};

export { Amount, useFormatAmount };
