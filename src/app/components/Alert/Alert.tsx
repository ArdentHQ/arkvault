import cn from "classnames";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import { Color } from "@/types";

export type AlertColor = Color | "danger-dark";

interface AlertProperties extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	title?: string;
	variant?: AlertColor;
	collapsible?: boolean;
}

interface AlertChevronProperties extends React.HTMLAttributes<HTMLSpanElement> {
	collapsed: boolean;
	variant?: AlertColor;
}

const TypeIcon = ({ variant }: { variant: AlertColor }) => {
	const iconVariant: Record<AlertColor, string> = {
		danger: "CircleCross",
		"danger-dark": "CircleCross",
		hint: "CircleQuestionMark",
		info: "CircleInfo",
		success: "CircleCheckMark",
		warning: "CircleExclamationMark",
	};

	return <Icon name={iconVariant[variant]} />;
};

const AlertHeader = ({ variant, collapsible, ...props }: AlertProperties) => (
	<div
		{...props}
		className={twMerge(
			"flex items-center space-x-2 px-4 py-2 text-sm font-semibold dark:text-white",
			cn({
				"cursor-pointer": collapsible === true,
				"bg-theme-danger-100 text-theme-danger-700 dark:bg-theme-danger-500": variant === "danger",
				"bg-theme-hint-100 text-theme-hint-700 dark:bg-theme-hint-700": variant === "hint",
				"bg-theme-info-100 text-theme-info-700 dark:bg-theme-info-700": variant === "info",
				"bg-theme-success-100 text-theme-success-700 dark:bg-theme-success-700": variant === "success",
				"bg-theme-warning-100 text-theme-warning-700 dark:bg-theme-warning-700":
					variant === "warning" || !variant,
				"bg-theme-danger-500 text-white": variant === "danger-dark",
			}),
			props.className,
		)}
	/>
);

const AlertBody = ({ variant, ...props }: AlertProperties) => (
	<div
		{...props}
		className={twMerge(
			"w-full break-words p-4 text-left text-sm leading-relaxed dark:bg-theme-secondary-800",
			cn({
				"bg-theme-danger-50": variant === "danger",
				"bg-theme-hint-50": variant === "hint",
				"bg-theme-info-50": variant === "info",
				"bg-theme-secondary-800 text-theme-secondary-200": variant === "danger-dark",
				"bg-theme-success-50": variant === "success",
				"bg-theme-warning-50": variant === "warning" || !variant,
			}),
			props.className,
		)}
	/>
);

const AlertChevron = ({ collapsed, variant, ...props }: AlertChevronProperties) => (
	<span
		{...props}
		className={twMerge(
			"!ml-auto transform transition-transform duration-100",
			cn({
				"rotate-0": collapsed,
				"rotate-180": !collapsed,
				"text-theme-danger-700 dark:text-white": variant === "danger",
				"text-theme-hint-700 dark:text-white": variant === "hint",
				"text-theme-info-700 dark:text-white": variant === "info",
				"text-theme-success-700 dark:text-white": variant === "success",
				"text-theme-warning-700 dark:text-white": variant === "warning" || !variant,
				"text-white": variant === "danger-dark",
			}),
			props.className,
		)}
	/>
);

export const Alert = ({
	variant = "warning",
	collapsible = false,
	children,
	className,
	title,
	...attributes
}: AlertProperties) => {
	const { t } = useTranslation();

	const [collapsed, setCollapsed] = useState(collapsible);

	return (
		<div className={cn("flex flex-col overflow-hidden rounded-xl", className)} {...attributes}>
			<AlertHeader
				variant={variant}
				onClick={() => collapsible && setCollapsed((current) => !current)}
				collapsible={collapsible}
			>
				<TypeIcon variant={variant} />
				<span>{title || t(`COMMON.ALERT.${variant.toUpperCase()}`)}</span>

				{collapsible && (
					<AlertChevron
						collapsed={collapsible ? false : collapsed}
						variant={variant}
						data-testid="Alert__chevron"
					>
						<Icon
							name="ChevronDownSmall"
							size="sm"
							className={cn("transition-transform duration-200", {
								"rotate-180": collapsed,
							})}
						/>
					</AlertChevron>
				)}
			</AlertHeader>

			{!collapsed && <AlertBody variant={variant}>{children}</AlertBody>}
		</div>
	);
};
