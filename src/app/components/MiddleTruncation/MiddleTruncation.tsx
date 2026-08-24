import React, { useLayoutEffect, useRef, useState } from "react";

import cn from "classnames";

import { Tooltip } from "@/app/components/Tooltip";
import { MiddleTruncator } from "./MiddleTruncator";

export type MiddleTruncationProps = React.ComponentPropsWithoutRef<"span"> & {
	children: string;
	tooltip?: boolean;
};

export function MiddleTruncation({ className, children, tooltip = true, ...props }: MiddleTruncationProps) {
	const containerRef = useRef<HTMLSpanElement>(null);
	const [displayedText, setDisplayedText] = useState<string | null>(null);

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

		const resizeObserver = new ResizeObserver(() => recalculate());
		resizeObserver.observe(element);
		return () => resizeObserver.disconnect();
	}, []);

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
