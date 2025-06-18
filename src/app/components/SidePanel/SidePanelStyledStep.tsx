import React from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

export const SidePanelStyledStep = ({ isActive, ...props }: React.HTMLProps<HTMLLIElement> & { isActive: boolean }) => (
	<li
		{...props}
		data-testid="SidePanelStyledStep"
		className={twMerge(
			"h-1 flex-1 transition-colors duration-300",
			cn({
				"bg-theme-primary-100 dark:bg-theme-secondary-800 dim:bg-theme-dim-700": !isActive,
				"bg-theme-warning-300": isActive,
			}),
			props.className,
		)}
	/>
);
