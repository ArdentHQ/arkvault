import cn from "classnames";
import React from "react";
import { Tooltip } from "@/app/components/Tooltip";

type Properties = {
	text: string;
	maxChars?: number;
	as?: React.ElementType;
	showTooltip?: boolean;
} & React.HTMLProps<any>;

export const TruncateEnd = ({ className, text, maxChars = 16, showTooltip = true, ...properties }: Properties) => {
	const result = React.useMemo(() => {
		if (!maxChars || text.length <= maxChars) {
			return text;
		}

		const start = text.slice(0, Math.max(0, maxChars));

		return `${start}…`;
	}, [maxChars, text]);

	return (
		<Tooltip content={text} disabled={!showTooltip}>
			<span
				data-testid="TruncateEnd"
				className={cn("no-ligatures transition-colors duration-200", className)}
				{...properties}
			>
				{result}
			</span>
		</Tooltip>
	);
};

export const TruncateEndResponsive: React.FC<{ children: ReactNode }> = ({
	children,
}) => {
	return (
		<span className="overflow-hidden whitespace-nowrap w-full relative inline-flex items-center">
			{/* Provide line-height and dimensions while keeping the element visually hidden */}
			<span className="w-0 overflow-hidden inline-block invisible">{children}</span>
			<span className="absolute inset-0 truncate">
				{children}
			</span>
		</span>
	);
};
