import cn from "classnames";
import React from "react";

import { Icon } from "@/app/components/Icon";

interface Properties {
	handleActiveItem: (key: string) => void;
	icon?: string;
	isActive: boolean;
	itemKey: string;
	label: string;
	route: string;
}

export const SideBarItem = ({ label, icon, itemKey, isActive, handleActiveItem }: Properties) => {
	return (
		<li
			className={cn(
				"relative border-b border-theme-secondary-300 py-1 first:pt-0 last:border-0 last:pb-0 dark:border-theme-secondary-800",
				isActive ? "cursor-default" : "cursor-pointer",
			)}
			onClick={() => handleActiveItem(itemKey)}
			data-testid={`side-menu__item--${itemKey}`}
		>
			<div
				className={cn(
					"group relative -ml-5 flex h-11 items-center rounded px-5 transition-all",
					isActive
						? "bg-theme-primary-100 text-theme-primary-600 dark:bg-theme-secondary-800 dark:text-theme-secondary-200"
						: "hover:bg-theme-secondary-100 hover:text-theme-primary-700 dark:hover:bg-black dark:hover:text-theme-secondary-200",
				)}
			>
				{isActive && <div className="absolute inset-y-0 left-0 w-1 rounded bg-theme-primary-600" />}

				{icon && (
					<div
						className={cn("mr-3", {
							"text-theme-primary-300 transition-all group-hover:text-theme-primary-600 dark:text-theme-secondary-600 dark:group-hover:text-theme-secondary-200":
								!isActive,
						})}
					>
						<Icon name={icon} size="lg" />
					</div>
				)}

				<span className="text-lg font-semibold">{label}</span>
			</div>
		</li>
	);
};
