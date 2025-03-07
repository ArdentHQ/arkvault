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
}

interface MobileTableElementRowProperties extends React.HTMLAttributes<HTMLDivElement> {
	title: string;
}

export const MobileTableElementRow = ({
	title,
	children,
	className,
	...properties
}: MobileTableElementRowProperties) => (
	<div className={twMerge("grid grid-cols-1 gap-2", className)} {...properties}>
		<div className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-dark-200">{title}</div>

		<div>{children}</div>
	</div>
);

export const MobileTableElement = ({
	bodyClassName,
	className,
	variant,
	title,
	titleExtra,
	children,
	...properties
}: MobileTableElementProperties) => (
	<div
		className={twMerge(
			classNames("flex flex-col overflow-hidden rounded border", {
				"border-theme-danger-400": variant === MobileTableElementVariant.danger,
				"border-theme-primary-300 dark:border-theme-dark-navy-400":
					variant === MobileTableElementVariant.primary,
				"border-theme-secondary-300 dark:border-theme-secondary-800": !variant,
				"border-theme-success-300 dark:border-theme-success-700": variant === MobileTableElementVariant.success,
				"border-theme-warning-400": variant === MobileTableElementVariant.warning,
			}),
			className,
		)}
		{...properties}
	>
		<div
			className={classNames("flex justify-between overflow-hidden px-4 py-3 dark:bg-theme-dark-950", {
				"bg-theme-danger-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.danger,
				"bg-theme-primary-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.primary,
				"bg-theme-secondary-100 dark:bg-black": !variant,
				"bg-theme-success-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.success,
				"bg-theme-warning-100 dark:bg-theme-dark-950": variant === MobileTableElementVariant.warning,
			})}
		>
			<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-text">{title}</span>

			{titleExtra}
		</div>

		<div className={twMerge("grid gap-4 px-4 py-3", bodyClassName)}>{children}</div>
	</div>
);
