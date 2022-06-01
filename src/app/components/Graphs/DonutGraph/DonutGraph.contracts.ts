import React from "react";
import { GraphAnimation } from "@/app/components/Graphs/GraphHoverAnimation/GraphHoverAnimation.contract";
import { GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";

const BACKGROUND_CIRCLE_SPACING = 16;
const GRAPH_MARGIN = 32;
const RADIUS_HOVER_INCREMENT = 16;
const SEGMENT_SPACING = 20;

interface DonutGraphProperties {
	data: GraphDataPoint[];
	size: number;
	renderTooltip?: (dataPoint: GraphDataPoint) => JSX.Element;
	renderContentInsideCircle?: () => JSX.Element;
}

interface DonutGraphConfig {
	circleCommonProperties: React.SVGProps<SVGCircleElement>;
	circumference: number;
	circumferenceHover: number;
	radius: number;
	radiusHover: number;
}

interface DonutGraphCircle {
	circleProperties: React.SVGProps<SVGCircleElement>;
	animations: GraphAnimation[];
}

interface ContentInsideCircleProperties {
	renderFunction: (() => JSX.Element) | undefined;
	size: number;
}

type UseDonutGraphHook = (
	data: GraphDataPoint[],
	size: number,
) => {
	backgroundCircle: React.SVGProps<SVGCircleElement>;
	circles: DonutGraphCircle[];
};

export { BACKGROUND_CIRCLE_SPACING, GRAPH_MARGIN, RADIUS_HOVER_INCREMENT, SEGMENT_SPACING };

export type {
	ContentInsideCircleProperties,
	DonutGraphCircle,
	DonutGraphConfig,
	DonutGraphProperties,
	UseDonutGraphHook,
};
