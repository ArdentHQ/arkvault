import React from "react";
import { twMerge } from "tailwind-merge";

export const SettingsGroup = ({ ...props }: React.HTMLProps<HTMLDivElement>) => (
	<div
		{...props}
		className={twMerge(
			"relative -mx-8 mt-8 border-t border-theme-secondary-300 px-8 pt-6 dark:border-theme-secondary-800 sm:border-0 sm:pt-0",
			props.className,
		)}
	/>
);
