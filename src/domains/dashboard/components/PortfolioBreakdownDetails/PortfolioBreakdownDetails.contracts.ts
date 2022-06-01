import { GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";
import { AssetItem } from "@/domains/dashboard/components/PortfolioBreakdown/PortfolioBreakdown.contracts";

const GRAPH_HEIGHT = 280;
const ONE_MILLION = 10 ** 6;

interface PortfolioBreakdownDetailsProperties {
	isOpen: boolean;
	assets: AssetItem[];
	exchangeCurrency: string;
	onClose: () => void;
	balance: number;
}

interface AssetListItemProperties {
	asset: AssetItem;
	index: number;
	exchangeCurrency: string;
	grouped: boolean;
}

interface AssetListProperties {
	assets: AssetItem[];
	exchangeCurrency: string;
	ungroupedAssetLabels: string[];
}

interface TooltipProperties {
	dataPoint: GraphDataPoint;
}

interface BalanceProperties {
	ticker: string;
	value: number;
}

export type {
	AssetListItemProperties,
	AssetListProperties,
	BalanceProperties,
	PortfolioBreakdownDetailsProperties,
	TooltipProperties,
};

export { GRAPH_HEIGHT, ONE_MILLION };
