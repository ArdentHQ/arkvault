import React, { FC, HTMLAttributes } from "react";
import cn from "classnames";

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export const MobileCard: FC<MobileCardProps> = ({ className, children, ...props }) => (
	<div
		className={cn(
			"w-full cursor-pointer overflow-hidden rounded border border-theme-secondary-300 bg-white dark:border-theme-secondary-800 dark:bg-theme-secondary-900",
			className,
		)}
		{...props}
	>
		{children}
	</div>
);
