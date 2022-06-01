import React, { useMemo } from "react";

import {
	BACKGROUND_CIRCLE_SPACING,
	DonutGraphCircle,
	DonutGraphConfig,
	GRAPH_MARGIN,
	RADIUS_HOVER_INCREMENT,
	SEGMENT_SPACING,
	UseDonutGraphHook,
} from "./DonutGraph.contracts";

const useDonutGraph: UseDonutGraphHook = (data, size) => {
	const { circleCommonProperties, circumference, circumferenceHover, radius, radiusHover } =
		useMemo<DonutGraphConfig>(() => {
			const diameter = size - GRAPH_MARGIN * 2;
			const center = size / 2;

			const radius = diameter / 2;
			const radiusHover = radius + RADIUS_HOVER_INCREMENT;

			return {
				circleCommonProperties: {
					cx: center,
					cy: center,
					fill: "transparent",
					r: radius,
					strokeLinecap: "round",
					strokeWidth: 16,
				},
				circumference: diameter * Math.PI,
				circumferenceHover: radiusHover * 2 * Math.PI,
				radius,
				radiusHover,
			};
		}, [size]);

	const backgroundCircle = useMemo<React.SVGProps<SVGCircleElement>>(
		() => ({
			...circleCommonProperties,
			className: "fill-current text-theme-secondary-200 dark:text-black",
			fill: "inherit",
			r: radius - BACKGROUND_CIRCLE_SPACING,
			strokeWidth: 0,
		}),
		[size], // eslint-disable-line react-hooks/exhaustive-deps
	);

	const circles = useMemo<DonutGraphCircle[]>(() => {
		const items: DonutGraphCircle[] = [];

		// When there is only 1 segment avoid showing
		// the space between start and end of it.
		const spacing = data.length > 1 ? SEGMENT_SPACING : 0;

		// By default circle dasharray starts at 90°, which would be 25 given a
		// circumference of 100. Set initial offset to 25 (in proportion to the
		// circumference) to make sure that the first slice will start at 12:00.
		let strokeDashoffset = circumference * 0.25;
		let strokeDashoffsetHover = circumferenceHover * 0.25;

		for (const { color, value } of data) {
			const dash = (circumference * value) / 100;
			const dashHover = (circumferenceHover * value) / 100;

			const gap = (circumference * (100 - value)) / 100;
			const gapHover = (circumferenceHover * (100 - value)) / 100;

			// stroke-dashoffset has to be equal to the sum of the
			// lengths of the previous segments or they will overlap.
			strokeDashoffset += dash;
			strokeDashoffsetHover += dashHover;

			const strokeDasharray = [dash - spacing, gap + spacing].join(" ");
			const strokeDasharrayHover = [dashHover - spacing, gapHover + spacing].join(" ");

			items.push({
				animations: [
					{ attribute: "r", from: radius, to: radiusHover },
					{ attribute: "stroke-dasharray", from: strokeDasharray, to: strokeDasharrayHover },
					{ attribute: "stroke-dashoffset", from: strokeDashoffset, to: strokeDashoffsetHover },
				],
				circleProperties: {
					...circleCommonProperties,
					className: `stroke-current text-theme-${color}`,
					strokeDasharray,
					strokeDashoffset,
				},
			});
		}

		return items;
	}, [circumference, data]); // eslint-disable-line react-hooks/exhaustive-deps

	return {
		backgroundCircle,
		circles,
	};
};

export { useDonutGraph };
