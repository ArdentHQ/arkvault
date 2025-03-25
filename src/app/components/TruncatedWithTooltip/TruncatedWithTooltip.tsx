import cn from "classnames";
import React, { useEffect, useRef, useState } from "react";
import { Tooltip } from "@/app/components/Tooltip";

interface TruncatedWithTooltipProperties extends Omit<React.HTMLProps<HTMLSpanElement>, "children"> {
	text: string;
}

export const TruncatedWithTooltip = ({ className, text, ...properties }: TruncatedWithTooltipProperties) => {
	const ref = useRef<HTMLSpanElement>(null);
	const [isTruncated, setIsTruncated] = useState(false);

	useEffect(() => {
		const checkTruncation: ResizeObserverCallback = (entries) => {
			const element = entries[0].target;

			setIsTruncated(element.scrollWidth > element.clientWidth);
		};

		const resizeObserver = new ResizeObserver(checkTruncation);

		if (ref.current) {
			resizeObserver.observe(ref.current);
		}

		return () => {
			if (ref.current) {
				resizeObserver.unobserve(ref.current);
			}
		};
	}, [text]);

	return (
		<Tooltip content={text} disabled={!isTruncated}>
			<span ref={ref} className={cn("truncate", className)} {...properties}>
				{text}
			</span>
		</Tooltip>
	);
};
