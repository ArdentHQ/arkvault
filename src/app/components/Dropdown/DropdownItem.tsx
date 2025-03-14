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
			"mx-1 my-1 flex items-center space-x-2 whitespace-nowrap px-5 py-4 text-left text-base font-semibold transition-colors-shadow duration-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-primary-400",
			cn({
				"bg-theme-secondary-200 text-theme-primary-600 dark:bg-theme-dark-950 dark:text-theme-dark-50":
					isActive,
				"cursor-pointer text-theme-secondary-700 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 dark:text-theme-dark-200 hover:dark:bg-theme-secondary-900":
					!isActive,
				"rounded-lg": !isActive && variant !== "navbar",
				"sm:rounded-lg": !isActive && variant === "navbar",
			}),
			props.className,
		)}
	/>
);
