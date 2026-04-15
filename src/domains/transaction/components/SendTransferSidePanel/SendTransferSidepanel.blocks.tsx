import { Amount } from "@/app/components/Amount";

export const ExchangeCurrencyAmount = ({
	convertedAmount,
	isTestnet,
	exchangeTicker,
}: {
	convertedAmount?: number;
	isTestnet?: boolean;
	exchangeTicker?: string;
}) => {
	return (
		<>
			{!isTestnet && !!convertedAmount && !!exchangeTicker && (
				<div className="text-theme-secondary-700 font-semibold">
					<Amount
						ticker={exchangeTicker}
						value={convertedAmount}
						className="text-sm break-all whitespace-normal md:text-base"
					/>
				</div>
			)}
		</>
	);
};
