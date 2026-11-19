import React, { HTMLProps } from "react";
import cn from "classnames";
import { DropdownListItem } from "@/app/components/SimpleDropdown";
import { Icon } from "@/app/components/Icon";

interface SelectOptionProperties extends HTMLProps<HTMLLIElement> {
	isActive: boolean;
}

export const SelectOption = ({ isActive, className, children, ...props }: SelectOptionProperties) => (
	<DropdownListItem
		{...props}
		className={cn(
			"mx-1 my-0.5 justify-between space-x-4 py-3.5",
			{
				"bg-theme-secondary-200 text-theme-primary-600 hover:text-theme-primary-600 dim:bg-theme-dim-950 dim:text-theme-dim-50 dark:bg-theme-dark-950 dark:text-theme-dark-50":
					isActive,
			},
			className,
		)}
	>
		{children}

		<span className="h-4 w-4 shrink-0">
			{isActive && (
				<Icon
					name="CheckmarkDouble"
					size="md"
					className="text-theme-primary-600 dim:text-theme-dim-50 dark:text-theme-secondary-200"
				/>
			)}
		</span>
	</DropdownListItem>
);
