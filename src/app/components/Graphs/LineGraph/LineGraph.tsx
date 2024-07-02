import React, { useMemo } from "react";

import { SmAndAbove, Xs } from "@/app/components/Breakpoint";
import { GraphHoverAnimation } from "@/app/components/Graphs/GraphHoverAnimation";
import { useGraphData, useGraphTooltip, useGraphWidth } from "@/app/components/Graphs/Graphs.shared";

import { LineGraphEmpty } from "./LineGraph.blocks";
import { BASE_CONFIG, LineGraphConfig, LineGraphProperties } from "./LineGraph.contracts";
import { useLineGraph } from "./LineGraph.helpers";

export const LineGraph: React.VFC<LineGraphProperties> = ({
	data,
	renderLegend,
	renderTooltip,
	renderAsEmpty,
	addToOtherGroup,
}) => {
	const [reference, graphWidth] = useGraphWidth();
	const [referenceMobile, graphWidthMobile] = useGraphWidth();
	const { group } = useGraphData("line", addToOtherGroup);
	const { Tooltip, getMouseEventProperties } = useGraphTooltip(renderTooltip, "line");

	const config = useMemo<LineGraphConfig>(() => ({ ...BASE_CONFIG, graphWidth }), [graphWidth]);

	const normalizedData = group(data, config.graphWidth);
	const rectangles = useLineGraph(normalizedData, config);

	const renderSegments = () => {
		if (renderAsEmpty) {
			return <LineGraphEmpty config={config} />;
		}

		return rectangles.map((rectProperties, index) => (
			<g key={index} data-testid="LineGraph__item">
				<rect
					{...rectProperties}
					{...getMouseEventProperties(normalizedData[index])}
					y={0}
					rx={0}
					opacity={0}
					height={config.hoverAreaHeight}
					id={`rectHoverArea__${index}`}
					data-testid="LineGraph__item-hover-area"
					pointerEvents="visiblePainted"
				/>
				<rect {...rectProperties} pointerEvents="none">
					<GraphHoverAnimation
						targetElementId={`rectHoverArea__${index}`}
						animations={[
							{ attribute: "height", from: config.segmentHeight, to: config.segmentHeightHover },
							{ attribute: "rx", from: config.segmentHeight / 2, to: config.segmentHeightHover / 2 },
							{ attribute: "y", from: config.segmentHeight, to: 0 },
						]}
					/>
				</rect>
			</g>
		));
	};

	const configMobile = useMemo<LineGraphConfig>(
		() => ({
			...BASE_CONFIG,
			graphWidth: graphWidthMobile,
			segmentSpacing: 0,
		}),
		[graphWidthMobile],
	);

	const normalizedDataMobile = group(data, configMobile.graphWidth);

	const rectanglesMobile = useLineGraph(normalizedDataMobile, configMobile);

	const renderMobileSegments = () => {
		if (renderAsEmpty) {
			return <LineGraphEmpty config={configMobile} dataTestid="LineGraph__empty__mobile" />;
		}

		return rectanglesMobile.map((rectProperties, index) => (
			<g key={index} data-testid="LineGraph__item__mobile">
				<rect
					{...rectProperties}
					{...getMouseEventProperties(normalizedDataMobile[index])}
					y={0}
					rx={0}
					opacity={0}
					height={configMobile.hoverAreaHeight}
					id={`rectHoverArea__${index}`}
					data-testid="LineGraph__item__mobile-hover-area"
					pointerEvents="visiblePainted"
				/>
				<rect {...rectProperties} rx={0} pointerEvents="none">
					<GraphHoverAnimation
						targetElementId={`rectHoverArea__${index}`}
						animations={[
							{
								attribute: "height",
								from: configMobile.segmentHeight,
								to: configMobile.segmentHeightHover,
							},
							{ attribute: "y", from: configMobile.segmentHeight, to: 0 },
						]}
					/>
				</rect>
			</g>
		));
	};

	return (
		<div className="flex flex-col-reverse sm:flex-col">
			<Tooltip />

			{!!renderLegend && (
				<div
					data-testid="LineGraph__legend"
					className="mt-3 flex justify-center sm:mb-1 sm:mt-0 sm:justify-start lg:justify-end"
				>
					{renderLegend(normalizedData)}
				</div>
			)}

			<Xs>
				<svg ref={referenceMobile} className="h-5 w-full" data-testid="LineGraph__svg__responsive">
					{!!graphWidthMobile && renderMobileSegments()}
				</svg>
			</Xs>

			<SmAndAbove>
				<svg ref={reference} className="h-5 w-full" data-testid="LineGraph__svg">
					{!!graphWidth && renderSegments()}
				</svg>
			</SmAndAbove>
		</div>
	);
};
