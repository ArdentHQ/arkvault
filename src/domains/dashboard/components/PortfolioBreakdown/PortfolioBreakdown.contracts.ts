import { Contracts } from "@payvo/sdk-profiles";
import { GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";

interface AssetItem {
	amount: number;
	convertedAmount: number;
	label: string;
	displayName: string;
	percent: number;
}

interface LegendProperties {
	dataPoints: GraphDataPoint[];
	hasZeroBalance: boolean;
	onMoreDetailsClick: () => void;
}

interface LabelledTextProperties {
	label: string;
	children: (textClassName: string) => JSX.Element;
}

interface TooltipProperties {
	dataPoint: GraphDataPoint;
}

interface PortfolioBreakdownProperties {
	profile: Contracts.IProfile;
	profileIsSyncingExchangeRates: boolean;
	selectedNetworkIds: string[];
	liveNetworkIds: string[];
}

export type { AssetItem, LabelledTextProperties, LegendProperties, PortfolioBreakdownProperties, TooltipProperties };
