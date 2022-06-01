import React from "react";

import { LineGraphEmptyProperties } from "./LineGraph.contracts";
import { GRAPH_COLOR_EMPTY, GRAPH_COLOR_EMPTY_DARK } from "@/app/components/Graphs/Graphs.contracts";

const LineGraphEmpty: React.VFC<LineGraphEmptyProperties> = ({ config, dataTestid = "LineGraph__empty" }) => (
	<rect
		x={0}
		y={config.segmentHeight}
		className={`fill-current text-theme-${GRAPH_COLOR_EMPTY} dark:text-theme-${GRAPH_COLOR_EMPTY_DARK}`}
		width={config.graphWidth}
		height={config.segmentHeight}
		rx={config.segmentHeight / 2}
		data-testid={dataTestid}
	/>
);

export { LineGraphEmpty };
