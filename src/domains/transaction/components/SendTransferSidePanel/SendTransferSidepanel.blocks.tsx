import { Amount } from "@/app/components/Amount";

export const ExchangeCurrencyAmount = ({
	convertedAmount,
	isTestnet,
	exchangeTicker,
}: {
	convertedAmount?: number;
	isTestnet?: boolean;
	exchangeTicker?: string;
}) => (
	<>
		{!isTestnet && !!convertedAmount && !!exchangeTicker && (
			<div className="font-semibold text-theme-secondary-700">
				<Amount
					ticker={exchangeTicker}
					value={convertedAmount}
					className="whitespace-normal break-all text-sm md:text-base"
				/>
			</div>
		)}
	</>
);
