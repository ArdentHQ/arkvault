import React, { useLayoutEffect, useRef, useState } from "react";

import cn from "classnames";

import { Tooltip } from "@/app/components/Tooltip";
import { MiddleTruncator } from "./MiddleTruncator";

export type MiddleTruncationProps = React.ComponentPropsWithoutRef<"span"> & {
	children: string;
	tooltip?: boolean;
	/** Smallest head + tail worth rendering; below this the text is omitted entirely. */
	minChars?: number;
};

interface Measurement {
	source: string;
	value: string;
}

export function MiddleTruncation({
	className,
	children,
	tooltip = true,
	minChars = 0,
	...props
}: MiddleTruncationProps) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const [measurement, setMeasurement] = useState<Measurement | null>(null);

	const displayedText = measurement?.source === children ? measurement.value : "";

	useLayoutEffect(() => {
		const element = containerRef.current;
		if (!element) {
			return;
		}

		const recalculate = () => {
			const availableWidth = element.offsetWidth;

			const computedStyle = window.getComputedStyle(element);
			const font = `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;

			setMeasurement((previous) => {
				// If the width is 0, the element hasn't loaded yet but it doesn't mean it's empty.
				// Clearing text here hides it forever because the observer won't trigger another resize to bring it back.
				if (availableWidth === 0 && previous?.source === children && previous.value !== "") {
					return previous;
				}

				return {
					source: children,
					value: MiddleTruncator.truncate(children, availableWidth, font, minChars),
				};
			});
		};

		recalculate();

		const resizeObserver = new ResizeObserver(() => recalculate());
		resizeObserver.observe(element);
		return () => resizeObserver.disconnect();
	}, [children, minChars]);

	const content = (
		<span
			ref={containerRef}
			className={cn("no-ligatures block w-full overflow-hidden text-ellipsis whitespace-nowrap", className)}
			{...props}
		>
			{displayedText}
		</span>
	);

	return <span className="block w-full">{tooltip ? <Tooltip content={children}>{content}</Tooltip> : content}</span>;
}
