import React from "react";
import { twMerge } from "tailwind-merge";

export const Dot = ({ className }: { className?: string }) => (
	<div
		className={twMerge(
			"absolute right-0 top-0 flex items-center justify-center rounded-full bg-theme-background p-0.5 transition-all duration-100 ease-linear group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800",
			className,
		)}
	>
		<div className="h-1.5 w-1.5 rounded-full bg-theme-danger-500" />
	</div>
);
