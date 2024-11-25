import React from "react";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

type CheckboxProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const Checkbox = ({ color = "success", ...props }: CheckboxProperties) => {
	return <input type="checkbox" className={twMerge("w-5 h-5 bg-transparent !rounded cursor-pointer !border-2 transition duration-150 ease-in-out focus:!ring-offset-0 focus:!ring-theme-primary-400 disabled:bg-theme-secondary-200 disabled:border-theme-secondary-300 disabled:cursor-not-allowed disabled:dark:bg-theme-secondary-800 disabled:dark:border-theme-secondary-600 [:not(:checked)]:border-theme-secondary-300 [:not(:checked)]:dark:border-theme-secondary-600 custom-checkbox", cn({
		"text-theme-danger-400 hover:border-theme-danger-400 checked:hover:text-theme-danger-500": color === "danger",
		"text-theme-hint-500 hover:border-theme-hint-500": color === "hint",
		"text-theme-primary-600 hover:border-theme-primary-600": color === "info",
		"text-theme-primary-600 hover:border-theme-primary-600 checked:hover:text-theme-primary-700": color === "success",
		"text-theme-warning-600 hover:border-theme-warning-600": color === "warning",
	}) , props.className)} {...props} />;
}
