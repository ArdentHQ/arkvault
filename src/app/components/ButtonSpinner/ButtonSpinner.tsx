import React from "react";
import { ButtonVariant } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

interface ButtonSpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
	variant?: ButtonVariant;
	className?: string;
}

export const ButtonSpinner = ({ variant, className, ...props }: ButtonSpinnerProps) => (
	<div
		className={twMerge(
			"h-6 w-6 animate-spin rounded-full border-4 border-theme-secondary-200 border-l-theme-primary-500",
			cn({
				"border-theme-danger-200 border-l-theme-danger-400 dark:border-theme-danger-500": variant === "danger",
				"border-theme-primary-700 border-l-white": variant === "primary",
				"border-white border-l-theme-primary-600 dark:border-theme-secondary-900": variant === "secondary",
			}),
			className,
		)}
		{...props}
	/>
);
