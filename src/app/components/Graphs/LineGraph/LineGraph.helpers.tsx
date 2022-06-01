import React, { useMemo } from "react";

import { LineGraphConfig } from "./LineGraph.contracts";
import { GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";

const useLineGraph = (data: GraphDataPoint[], config: LineGraphConfig): React.SVGProps<SVGRectElement>[] => {
	const { graphWidth, segmentSpacing, segmentHeight } = config;

	return useMemo<React.SVGProps<SVGRectElement>[]>(() => {
		const rectangles: React.SVGProps<SVGRectElement>[] = [];

		let x = 0;

		for (let index = 0; index < data.length; index++) {
			const item = data[index];

			let width: number;

			if (data.length === 1) {
				width = graphWidth;
			} else {
				width = (item.value * graphWidth) / 100;
			}

			if (index < data.length - 1) {
				// Decrease width by spacing to every item except the last one.
				width -= segmentSpacing;
			}

			rectangles.push({
				className: `fill-current text-theme-${item.color}`,
				height: segmentHeight,
				rx: segmentHeight / 2,
				width,
				x,
				y: segmentHeight,
			});

			x += width + segmentSpacing;
		}

		return rectangles;
	}, [data, graphWidth]); // eslint-disable-line react-hooks/exhaustive-deps
};

export { useLineGraph };
