import { AddToOtherGroupFunction, GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";

interface LineGraphConfig {
	graphWidth: number;
	hoverAreaHeight: number;
	segmentHeight: number;
	segmentHeightHover: number;
	segmentSpacing: number;
}

interface LineGraphProperties {
	data: GraphDataPoint[];
	renderLegend?: (dataPoints: GraphDataPoint[]) => JSX.Element;
	renderTooltip?: (dataPoint: GraphDataPoint) => JSX.Element;
	renderAsEmpty?: boolean;
	addToOtherGroup?: AddToOtherGroupFunction;
}

interface LineGraphEmptyProperties {
	config: LineGraphConfig;
	dataTestid?: string;
}

const BASE_CONFIG: Omit<LineGraphConfig, "graphWidth"> = {
	hoverAreaHeight: 20,
	segmentHeight: 8,
	segmentHeightHover: 16,
	segmentSpacing: 8,
};

export { BASE_CONFIG };

export type { LineGraphConfig, LineGraphEmptyProperties, LineGraphProperties };
