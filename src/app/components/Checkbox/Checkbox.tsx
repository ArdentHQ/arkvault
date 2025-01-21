import React, { forwardRef } from "react";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

type CheckboxProperties = {
	color?: Color;
} & React.InputHTMLAttributes<HTMLInputElement> &
	React.RefAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProperties>(({ color = "success", ...props }, ref) => {
	const { className, ...propsWithoutClass } = props;
	return (
		<input
			type="checkbox"
			ref={ref}
			className={twMerge(
				"custom-checkbox !h-5 !w-5 cursor-pointer !rounded !border-2 transition duration-150 ease-in-out focus:!ring-theme-primary-400 focus:!ring-offset-0 disabled:cursor-not-allowed disabled:border-theme-secondary-300 disabled:bg-theme-secondary-200 disabled:dark:border-theme-secondary-600 disabled:dark:bg-theme-secondary-800 [&:not(:checked)]:border-theme-secondary-300 [&:not(:checked)]:!bg-transparent [&:not(:checked)]:dark:border-theme-secondary-600",
				cn({
					"checked:text-theme-danger-400 checked:hover:text-theme-danger-500 [&:not(:checked)]:hover:border-theme-danger-400":
						color === "danger",
					"checked:text-theme-hint-500 [&:not(:checked)]:hover:border-theme-hint-500": color === "hint",
					"checked:text-theme-primary-600 [&:not(:checked)]:hover:border-theme-primary-600": color === "info",
					"checked:text-theme-primary-600 checked:hover:text-theme-primary-700 [&:not(:checked)]:hover:border-theme-primary-600":
						color === "success",
					"checked:text-theme-warning-600 [&:not(:checked)]:hover:border-theme-warning-600":
						color === "warning",
				}),
				className,
			)}
			{...propsWithoutClass}
		/>
	);
});

Checkbox.displayName = "Checkbox";
