import React, { forwardRef } from "react";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

type CheckboxProperties = {
	color?: Color;
} & React.InputHTMLAttributes<HTMLInputElement> &
	React.RefAttributes<HTMLInputElement>;

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProperties>(({ color = "success", ...props }, ref) => {
	const { className, disabled, ...otherProps } = props;
	return (
		<input
			type="checkbox"
			ref={ref}
			disabled={disabled}
			className={twMerge(
				"custom-checkbox !h-5 !w-5 cursor-pointer !rounded !border-2 transition duration-150 ease-in-out focus:!ring-theme-primary-400 focus:!ring-offset-0",
				"[&:not(:checked)]:border-theme-secondary-300 [&:not(:checked)]:!bg-white",
				"[&:not(:checked)]:dark:border-theme-dark-500 [&:not(:checked)]:dark:!bg-theme-dark-900",
				"disabled:cursor-not-allowed disabled:border-theme-secondary-300 disabled:bg-theme-secondary-200 disabled:checked:border-theme-secondary-300 disabled:checked:bg-theme-secondary-200 disabled:checked:text-theme-secondary-300 disabled:dark:border-theme-dark-600 disabled:dark:bg-theme-dark-800 disabled:checked:dark:border-theme-dark-600 disabled:checked:dark:bg-theme-dark-800 disabled:checked:dark:text-theme-dark-600",
				cn({
					"checked:text-theme-danger-500 checked:hover:text-theme-danger-600 dark:checked:border-theme-danger-400 dark:checked:hover:text-theme-danger-500 [&:not(:checked)]:hover:border-theme-danger-500":
						color === "danger" && !disabled,
					"checked:text-theme-hint-500 [&:not(:checked)]:hover:border-theme-hint-500":
						color === "hint" && !disabled,
					"checked:text-theme-primary-600 [&:not(:checked)]:hover:border-theme-primary-600":
						color === "info" && !disabled,
					"checked:text-theme-primary-600 checked:hover:text-theme-primary-700 checked:dark:checked:text-theme-dark-navy-500 checked:dark:hover:text-theme-dark-navy-600 [&:not(:checked)]:hover:border-theme-primary-600 dark:[&:not(:checked)]:hover:border-theme-dark-navy-500":
						color === "success" && !disabled,
					"checked:text-theme-warning-600 [&:not(:checked)]:hover:border-theme-warning-600":
						color === "warning" && !disabled,
				}),
				className,
			)}
			{...otherProps}
		/>
	);
});

Checkbox.displayName = "Checkbox";
