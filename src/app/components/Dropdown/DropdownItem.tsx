import React from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";
import { DropdownVariantType } from "./Dropdown.contracts";

export const DropdownItem = ({
	isActive,
	variant,
	...props
}: { isActive: boolean; variant?: DropdownVariantType } & React.HTMLProps<HTMLLIElement>) => (
	<li
		{...props}
		className={twMerge(
			"transition-colors-shadow focus:ring-theme-primary-400 flex items-center text-left text-base font-semibold whitespace-nowrap duration-100 focus:ring-2 focus:outline-hidden focus:ring-inset",
			cn({
				"bg-theme-secondary-200 text-theme-primary-600 dark:bg-theme-dark-950 dark:text-theme-dark-50 dim:bg-theme-dim-950 dim:text-theme-dim-50":
					isActive,
				"mx-1 my-1 space-x-2 rounded px-5 py-4": variant !== "options",
				"my-0.5 justify-between rounded-lg px-5 py-[14px]": variant === "options",
				"rounded-lg": !isActive && variant !== "navbar",
				"sm:rounded-lg": !isActive && variant === "navbar",
				"text-theme-secondary-700 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 dark:text-theme-dark-200 dark:hover:bg-theme-dark-700 dark:hover:text-theme-dark-50 dim:text-theme-dim-200 dim-hover:text-theme-dim-50 dim-hover:bg-theme-dim-700 cursor-pointer":
					!isActive,
			}),
			props.className,
		)}
	/>
);
