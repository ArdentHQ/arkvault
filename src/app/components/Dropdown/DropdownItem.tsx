import React from "react";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

export const DropdownItem = ({ isActive, ...props }: { isActive: boolean } & React.HTMLProps<HTMLLIElement>) => (
	<li
		{...props}
		className={twMerge(
			"my-1 flex items-center space-x-2 whitespace-nowrap border-l-4 px-6 py-4 text-left text-base font-semibold transition-colors-shadow duration-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-theme-primary-400",
			cn({
				"border-theme-primary-600 bg-theme-primary-50 text-theme-primary-600 dark:bg-black": isActive,
				"cursor-pointer rounded-lg border-transparent text-theme-secondary-700 hover:bg-theme-secondary-200 hover:text-theme-secondary-900 dark:text-theme-secondary-200 hover:dark:bg-theme-secondary-900 hover:dark:text-theme-secondary-200":
					!isActive,
			}),
			props.className,
		)}
	/>
);
