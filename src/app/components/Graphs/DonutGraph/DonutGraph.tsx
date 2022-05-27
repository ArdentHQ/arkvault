import { sortBy } from "@payvo/sdk-helpers";
import React, { useMemo } from "react";

import { ContentInsideCircle } from "./DonutGraph.blocks";
import { DonutGraphProperties } from "./DonutGraph.contracts";
import { useDonutGraph } from "./DonutGraph.helpers";
import { useGraphTooltip } from "@/app/components/Graphs/Graphs.shared";
import { GraphHoverAnimation } from "@/app/components/Graphs/GraphHoverAnimation";

export const DonutGraph: React.VFC<DonutGraphProperties> = ({
	data,
	size,
	renderTooltip,
	renderContentInsideCircle,
}) => {
	const sortedData = useMemo(() => sortBy(data, (item) => item.value), [data]);

	const { Tooltip, getMouseEventProperties } = useGraphTooltip(renderTooltip, "donut");
	const { circles, backgroundCircle } = useDonutGraph(sortedData, size);

	const renderCircles = () =>
		circles.map(({ circleProperties, animations }, index) => (
			<g key={index} data-testid="DonutGraph__item">
				<circle
					{...circleProperties}
					id={`circleTrackLine__${index}`}
					data-testid="DonutGraph__item-track-line"
					className="stroke-current text-theme-secondary-300 dark:text-theme-secondary-800"
					strokeWidth={2}
					pointerEvents="none"
				/>
				<circle
					{...circleProperties}
					id={`circleHoverArea__${index}`}
					data-testid="DonutGraph__item-hover-area"
					strokeWidth={40}
					opacity={0}
					pointerEvents="visibleStroke"
					{...getMouseEventProperties(sortedData[index])}
				/>
				<circle {...circleProperties} pointerEvents="none">
					<GraphHoverAnimation targetElementId={`circleHoverArea__${index}`} animations={animations} />
				</circle>
			</g>
		));

	return (
		<div className="relative">
			<Tooltip />

			<ContentInsideCircle renderFunction={renderContentInsideCircle} size={size} />

			<svg width={size} height={size} data-testid="DonutGraph__svg">
				<circle {...backgroundCircle} />

				{renderCircles()}
			</svg>
		</div>
	);
};
