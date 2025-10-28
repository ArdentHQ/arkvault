import React, { FC, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export const MobileCard: FC<MobileCardProps> = ({ className, children, ...props }) => (
	<div
		className={twMerge(
			"border-theme-secondary-300 dark:border-theme-secondary-800 dark:bg-theme-background dim:border-theme-dim-700 dim:bg-theme-background w-full cursor-pointer overflow-hidden rounded border bg-white",
			className,
		)}
		{...props}
	>
		{children}
	</div>
);
