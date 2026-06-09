import React, { FC, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export const MobileCard: FC<MobileCardProps> = ({ className, children, ...props }) => (
	<div
		className={twMerge(
			"w-full cursor-pointer overflow-hidden rounded border border-theme-secondary-300 bg-white dim:border-theme-dim-700 dim:bg-theme-background dark:border-theme-secondary-800 dark:bg-theme-background",
			className,
		)}
		{...props}
	>
		{children}
	</div>
);
