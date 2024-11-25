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

const AlertHeader = ({variant, collapsible, ...props}: AlertProperties) => {
	return (
		<div className={twMerge("flex items-center py-2 px-4 space-x-2 text-sm font-semibold dark:text-white", cn({
			"text-theme-danger-700 bg-theme-danger-100 dark:bg-theme-danger-500": variant === "danger",
			"text-white bg-theme-danger-500": variant === "danger-dark",
			"text-theme-hint-700 bg-theme-hint-100 dark:bg-theme-hint-700": variant === "hint",
			"text-theme-info-700 bg-theme-info-100 dark:bg-theme-info-700": variant === "info",
			"text-theme-success-700 bg-theme-success-100 dark:bg-theme-success-700": variant === "success",
			"text-theme-warning-700 bg-theme-warning-100 dark:bg-theme-warning-700": variant === "warning" || !variant,
			"cursor-pointer": collapsible === true,
		}) ,props.className)} {...props} />
	)
}

const AlertBody = ({variant, ...props}: AlertProperties) => {
	return (
		<div className={twMerge("w-full p-4 text-sm leading-relaxed break-words text-left dark:bg-theme-secondary-800", cn({
			"bg-theme-danger-50": variant === "danger",
			"bg-theme-secondary-800 text-theme-secondary-200": variant === "danger-dark",
			"bg-theme-hint-50": variant === "hint",
			"bg-theme-info-50": variant === "info",
			"bg-theme-success-50": variant === "success",
			"bg-theme-warning-50": variant === "warning" || !variant,
		}), props.className)} {...props} />
	)
}

const AlertChevron = ({collapsed, variant, ...props}: AlertChevronProperties) => {
	return (
		<span className={twMerge("transform !ml-auto duration-100 transition-transform", cn({
			"text-theme-danger-700 dark:text-white": variant === "danger",
			"text-white": variant === "danger-dark",
			"text-theme-hint-700 dark:text-white": variant === "hint",
			"text-theme-info-700 dark:text-white": variant === "info",
			"text-theme-success-700 dark:text-white": variant === "success",
			"text-theme-warning-700 dark:text-white": variant === "warning" || !variant
		}), props.className)} {...props} />
	)
}

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
