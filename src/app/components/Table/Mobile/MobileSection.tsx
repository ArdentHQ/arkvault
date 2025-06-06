import React, { FC, HTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

interface MobileSectionProps extends HTMLAttributes<HTMLDivElement> {
	className?: string;
	title: string;
}

export const MobileSection: FC<MobileSectionProps> = ({ className, title, children, ...props }) => (
	<div className={twMerge("flex w-36 flex-col gap-2", className)} {...props}>
		<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-sm font-semibold">
			{title}
		</span>

		<div className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 text-sm font-semibold">
			{children}
		</div>
	</div>
);
