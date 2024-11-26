import React from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

export type DividerTypeProperties = "horizontal" | "vertical";
export type DividerSizeProperties = "sm" | "md" | "lg" | "xl";

interface DividerProperties {
	type?: DividerTypeProperties;
	size?: DividerSizeProperties;
	dashed?: boolean;
	className?: string;
}
export type DividerStylesProperties = Omit<DividerProperties, "className">;

export const Divider = ({
	className = "border-theme-secondary-300 dark:border-theme-secondary-800",
	type = "horizontal",
	dashed,
	size,
	...props
}: React.HTMLAttributes<HTMLDivElement> & DividerProperties) => (
	<div
		{...props}
		className={twMerge(
			"h-4 border-t border-solid",
			cn({
				"border-dashed [background:none]": dashed,
				"clear-both my-4 flex w-full min-w-full": type === "horizontal",
				"h-10": type !== "horizontal" && size === "xl",
				"h-2": type !== "horizontal" && size === "sm",
				"h-4": type !== "horizontal" && size && !["sm", "md", "lg", "xl"].includes(size),
				"h-5": type !== "horizontal" && size === "md",
				"h-8": type !== "horizontal" && size === "lg",
				"relative mx-2 inline-block border-l border-t-0 border-solid align-middle": type !== "horizontal",
			}),
			className,
		)}
	/>
);
