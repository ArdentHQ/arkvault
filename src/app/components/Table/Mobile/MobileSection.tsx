import React, { FC, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface MobileSectionProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
	title: string;
}

export const MobileSection: FC<MobileSectionProps> = ({ className, title, children, ...props }) => (
	<div className={twMerge("flex w-36 flex-col gap-2", className)} {...props}>
		<span className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">{title}</span>

		<div className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">{children}</div>
	</div>
);
