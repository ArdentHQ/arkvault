import React from "react";
import { twMerge } from "tailwind-merge";

export const Dot = ({ className }: { className?: string }) => (
	<div
		className={twMerge(
			"bg-theme-background group-hover:bg-theme-primary-100 dark:group-hover:bg-theme-secondary-800 absolute top-0 right-0 flex items-center justify-center rounded-full p-0.5 transition-all duration-100 ease-linear",
			className,
		)}
	>
		<div className="bg-theme-danger-500 h-1.5 w-1.5 rounded-full" />
	</div>
);
