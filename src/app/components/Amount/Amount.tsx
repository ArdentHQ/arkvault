import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { Contracts, Helpers } from "@/app/lib/profiles";
import cn from "classnames";
import React from "react";
import { Tooltip } from "@/app/components/Tooltip";

interface AmountProperties {
	ticker: string;
	value: number;
	showSign?: boolean;
	showTicker?: boolean;
	isNegative?: boolean;
	className?: string;
	allowHideBalance?: boolean;
	profile?: Contracts.IProfile;
	decimals?: number;
	showCompactFormat?: boolean;
}

const Amount = ({
	value,
	ticker,
	showTicker = true,
	isNegative,
	showSign,
	className,
	allowHideBalance = false,
	profile,
	decimals,
	showCompactFormat,
}: AmountProperties) => {
	const compact = Helpers.Currency.formatCompact(value, ticker, { decimals, withTicker: showTicker });
	const fullAmount = Helpers.Currency.format(value, ticker, { decimals, withTicker: showTicker });
	let formattedAmount = showCompactFormat ? compact : fullAmount;

	const { hideBalance } = useBalanceVisibility({ profile });

	if (hideBalance && allowHideBalance) {
		formattedAmount = formattedAmount.replaceAll(/[\d,.]+/g, "****");
		return (
			<span data-testid="Amount" className={cn("whitespace-nowrap", className)}>
				{formattedAmount}
			</span>
		);
	}

	if (showSign) {
		formattedAmount = `${isNegative ? "-" : "+"} ${formattedAmount}`;
	}

	return (
		<Tooltip content={fullAmount} disabled={!showCompactFormat}>
			<span data-testid="Amount" className={cn("whitespace-nowrap", className)}>
				{formattedAmount}
			</span>
		</Tooltip>
	);
};

export { Amount };
