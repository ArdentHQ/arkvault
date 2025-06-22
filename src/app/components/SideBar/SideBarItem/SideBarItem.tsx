import cn from "classnames";
import React from "react";
import { RouteComponentProps, withRouter } from "react-router-dom";

interface Properties {
	handleActiveItem: (key: string) => void;
	isActive: boolean;
	itemKey: string;
	label: string;
	route: string;
}

export const SideBarItem = withRouter(
	({ label, itemKey, isActive, handleActiveItem }: Properties & RouteComponentProps) => (
		<li
			className={cn("relative", isActive ? "cursor-default" : "cursor-pointer")}
			onClick={() => handleActiveItem(itemKey)}
			data-testid={`side-menu__item--${itemKey}`}
		>
			<div
				className={cn(
					"group relative flex h-12 items-center rounded-lg px-5 transition-all",
					isActive
						? "bg-theme-secondary-200 text-theme-primary-600 dark:bg-theme-dark-950 dark:text-theme-dark-50 dim:bg-theme-dim-950 dim:text-theme-dim-50"
						: "hover:bg-theme-secondary-200 hover:text-theme-secondary-800 dark:hover:bg-theme-dark-950 dark:hover:text-theme-dark-50 dim-hover:bg-theme-dim-950 dim-hover:text-theme-dim-50",
				)}
			>
				<span className="font-semibold">{label}</span>
			</div>
		</li>
	),
);
