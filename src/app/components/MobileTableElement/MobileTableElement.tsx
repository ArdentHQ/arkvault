import React from "react";
import classNames from "classnames";
import { twMerge } from "tailwind-merge";

export enum MobileTableElementVariant {
	danger = "danger",
	primary = "primary",
	success = "success",
	warning = "warning",
}

interface MobileTableElementProperties extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
	title: string | React.ReactNode;
	titleExtra?: React.ReactNode;
	variant?: MobileTableElementVariant;
	bodyClassName?: string;
	onHeaderClick?: (event: React.MouseEvent) => void;
}

interface MobileTableElementRowProperties extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
	bodyClassName?: string;
}

export const MobileTableElementRow = ({
	title,
	children,
	className,
	bodyClassName,
	...properties
}: MobileTableElementRowProperties) => (
	<div className={twMerge("grid grid-cols-1 gap-2", className)} {...properties}>
		<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 text-sm font-semibold">
			{title}
		</div>

		<div className={bodyClassName}>{children}</div>
	</div>
);

export const MobileTableElement = ({
	bodyClassName,
	className,
	variant,
	title,
	titleExtra,
	children,
	onHeaderClick,
	...properties
}: MobileTableElementProperties) => (
	<div
		className={twMerge(
			classNames("flex w-full max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded border", {
				"border-theme-danger-400": variant === MobileTableElementVariant.danger,
				"border-theme-primary-300 dark:border-theme-dark-navy-400":
					variant === MobileTableElementVariant.primary,
				"border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700": !variant,
				"border-theme-success-300 dark:border-theme-success-700": variant === MobileTableElementVariant.success,
				"border-theme-warning-400": variant === MobileTableElementVariant.warning,
			}),
			className,
		)}
		data-testid="mobile-table-element"
		{...properties}
	>
		<div
			data-testid="mobile-table-element-header"
			className={classNames("dark:bg-theme-dark-950 flex space-x-3 overflow-auto px-4 py-3", {
				"bg-theme-danger-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.danger,
				"bg-theme-primary-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.primary,
				"bg-theme-secondary-100 dim:bg-theme-dim-950 dark:bg-black": !variant,
				"bg-theme-success-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.success,
				"bg-theme-warning-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.warning,
			})}
			onClick={onHeaderClick}
		>
			<span className="text-theme-secondary-900 dark:text-theme-text flex-1 truncate text-sm font-semibold">
				{title}
			</span>

			{titleExtra}
		</div>

		<div className={twMerge("grid gap-4 px-4 py-3", bodyClassName)} data-testid="mobile-table-element-body">
			{children}
		</div>
	</div>
);
