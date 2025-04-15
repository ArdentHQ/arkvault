import React, { FC, HTMLAttributes } from "react";
import cn from "classnames";

interface MobileCardProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
}

export const MobileCard: FC<MobileCardProps> = ({ className, children, ...props }) => (
	<div
		className={cn(
			"border-theme-secondary-300 dark:border-theme-secondary-800 dark:bg-theme-background w-full cursor-pointer overflow-hidden rounded-xs border bg-white",
			className,
		)}
		{...props}
	>
		{children}
	</div>
);
