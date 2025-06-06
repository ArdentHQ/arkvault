import cn from "classnames";
import React from "react";

import { Size } from "@/types";

type EmptyBlockProperties = {
	className?: string;
	children?: React.ReactNode;
	size?: Size;
} & Omit<React.HTMLProps<any>, "size">;

export const EmptyBlock = ({ className = "", children, size = "md", ...properties }: EmptyBlockProperties) => {
	const padding = size === "sm" ? "sm:py-3 px-4" : "sm:p-6";

	return (
		<div
			data-testid="EmptyBlock"
			className={cn(
				"border-theme-secondary-300 text-theme-secondary-text dark:border-theme-secondary-800 dim:border-theme-dim-700 rounded-lg border-solid text-center leading-5 sm:border",
				padding,
				className,
			)}
			{...properties}
		>
			{children && <div>{children}</div>}
		</div>
	);
};
