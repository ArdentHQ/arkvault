import { useBalanceVisibility } from "@/app/hooks/use-balance-visibility";
import { Contracts, Helpers } from "@/app/lib/profiles";
import { Tooltip } from "@/app/components/Tooltip";
import { twMerge } from "tailwind-merge";
import { BigNumber } from "@/app/lib/helpers";

interface AmountProperties {
	ticker: string;
	value: number | string | BigNumber;
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
	const fullAmount = Helpers.Currency.format(BigNumber.make(value, decimals).toString(), ticker, {
		decimals,
		withTicker: showTicker,
	});
	let formattedAmount = showCompactFormat ? compact : fullAmount;

	const { hideBalance } = useBalanceVisibility({ profile });

	if (hideBalance && allowHideBalance) {
		formattedAmount = formattedAmount.replaceAll(/[\d,.]+/g, "****");
		return (
			<span data-testid="Amount" className={twMerge("whitespace-nowrap", className)}>
				{formattedAmount}
			</span>
		);
	}

	if (showSign) {
		formattedAmount = `${isNegative ? "-" : "+"} ${formattedAmount}`;
	}

	if (showCompactFormat) {
		return (
			<Tooltip content={fullAmount}>
				<span data-testid="Amount" className={twMerge("whitespace-nowrap", className)}>
					{formattedAmount}
				</span>
			</Tooltip>
		);
	}

	return (
		<span data-testid="Amount" className={twMerge("whitespace-nowrap", className)}>
			{formattedAmount}
		</span>
	);
};

export { Amount };
