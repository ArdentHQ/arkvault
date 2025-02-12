import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { Contracts, Helpers } from "@ardenthq/sdk-profiles";
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
	profile?: Contracts.IProfile;
}

const Amount: React.VFC<AmountProperties> = ({
	value,
	ticker,
	showTicker = true,
	isNegative,
	showSign,
	className,
	allowHideBalance = false,
	profile,
}) => {
	let formattedAmount = Helpers.Currency.format(value, ticker, { withTicker: showTicker });

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
		<span data-testid="Amount" className={cn("whitespace-nowrap", className)}>
			{formattedAmount}
		</span>
	);
};

export { Amount };
