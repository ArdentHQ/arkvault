import React, { useLayoutEffect, useRef, useState } from "react";

import cn from "classnames";

import { MiddleTruncator } from "./MiddleTruncator";

export type MiddleTruncationProps = React.ComponentPropsWithoutRef<"span"> & {
	children: string;
};

export function MiddleTruncation({ className, children, ...props }: MiddleTruncationProps) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const [displayedText, setDisplayedText] = useState(children);

	useLayoutEffect(() => {
		const element = containerRef.current;
		if (!element) {
			return;
		}

		const recalculate = () => {
			const computedStyle = window.getComputedStyle(element);
			const font = `${computedStyle.fontStyle} ${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
			setDisplayedText(MiddleTruncator.truncate(children, element.offsetWidth, font));
		};

		recalculate();

		const resizeObserver = new ResizeObserver(() => requestAnimationFrame(recalculate));
		resizeObserver.observe(element);
		return () => resizeObserver.disconnect();
	}, [children]);

	return (
		<span
			ref={containerRef}
			className={cn("no-ligatures block overflow-hidden text-ellipsis whitespace-nowrap", className)}
			title={children}
			{...props}
		>
			{displayedText}
		</span>
	);
}
