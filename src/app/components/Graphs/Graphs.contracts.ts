import React, { MouseEvent, MutableRefObject } from "react";

type GraphType = "line" | "donut";

interface GraphDataPoint {
	color: string;
	data: Record<string, any>;
	value: number;
}

const GRAPH_COLOR_EMPTY = "secondary-300";
const GRAPH_COLOR_EMPTY_DARK = "secondary-800";

const GRAPH_COLOR_OTHER = "secondary-400";
const GRAPH_COLOR_OTHER_DARK = "secondary-600";

const GRAPH_COLORS = ["success-600", "warning-600", "info-600", "danger-400", "hint-400", GRAPH_COLOR_OTHER] as const;
const GRAPH_COLORS_DARK = [
	"success-600",
	"warning-600",
	"info-600",
	"danger-400",
	"hint-400",
	GRAPH_COLOR_OTHER_DARK,
] as const;

// Values calculated as [size * minimum visible value].
// The bigger the value, the higher the chance for
// smallest data points to end up in the "other" group.
const GRAPH_MIN_VALUE: Record<GraphType, number> = {
	donut: 1120,
	line: 3200,
};

type AddToOtherGroupFunction = (otherGroup: GraphDataPoint | undefined, entry: GraphDataPoint) => GraphDataPoint;

type UseGraphDataHook = (
	graphType: GraphType,
	addToOtherGroup: AddToOtherGroupFunction | undefined,
) => {
	group: (data: GraphDataPoint[], size: number) => GraphDataPoint[];
};

type UseGraphWidthHook = () => [MutableRefObject<SVGSVGElement | null>, number];

type UseGraphTooltipHook = (
	renderFunction: ((dataPoint: GraphDataPoint) => JSX.Element) | undefined,
	type: GraphType,
) => {
	Tooltip: React.VFC;
	getMouseEventProperties: (dataPoint: GraphDataPoint) => {
		onMouseMove: (event: MouseEvent<SVGElement>) => void;
		onMouseOut: (event: MouseEvent<SVGElement>) => void;
	};
};

export type {
	AddToOtherGroupFunction,
	GraphDataPoint,
	GraphType,
	UseGraphDataHook,
	UseGraphTooltipHook,
	UseGraphWidthHook,
};

export {
	GRAPH_COLOR_EMPTY,
	GRAPH_COLOR_EMPTY_DARK,
	GRAPH_COLOR_OTHER,
	GRAPH_COLOR_OTHER_DARK,
	GRAPH_COLORS,
	GRAPH_COLORS_DARK,
	GRAPH_MIN_VALUE,
};
