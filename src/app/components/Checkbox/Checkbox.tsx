import React, { forwardRef } from "react";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

type CheckboxProperties = {
    color?: Color;
} & React.InputHTMLAttributes<HTMLInputElement> & React.RefAttributes<HTMLInputElement>;

export const Checkbox =	forwardRef<HTMLInputElement, CheckboxProperties>(({ color = "success", ...props }, ref) => <input type="checkbox" ref={ref} className={twMerge("!w-5 !h-5 bg-transparent !rounded cursor-pointer !border-2 transition duration-150 ease-in-out focus:!ring-offset-0 focus:!ring-theme-primary-400 disabled:bg-theme-secondary-200 disabled:border-theme-secondary-300 disabled:cursor-not-allowed disabled:dark:bg-theme-secondary-800 disabled:dark:border-theme-secondary-600 [&:not(:checked)]:border-theme-secondary-300 [&:not(:checked)]:dark:border-theme-secondary-600 custom-checkbox", cn({
		"checked:text-theme-danger-400 [&:not(:checked)]:hover:border-theme-danger-400 checked:hover:text-theme-danger-500": color === "danger",
		"checked:text-theme-hint-500 [&:not(:checked)]:hover:border-theme-hint-500": color === "hint",
		"checked:text-theme-primary-600 [&:not(:checked)]:hover:border-theme-primary-600": color === "info",
		"checked:text-theme-primary-600 [&:not(:checked)]:hover:border-theme-primary-600 checked:hover:text-theme-primary-700": color === "success",
		"checked:text-theme-warning-600 [&:not(:checked)]:hover:border-theme-warning-600": color === "warning",
	}) , props.className)} {...props} />)

Checkbox.displayName = "Checkbox";