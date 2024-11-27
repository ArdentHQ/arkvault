import React from "react";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

type RadioButtonProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const RadioButton = ({ color = "success", ...props }: RadioButtonProperties & React.InputHTMLAttributes<any>) => (
		<input {...props} type="radio" className={twMerge("w-4 h-4 transition duration-150 ease-in-out cursor-pointer focus:ring-offset-0 border-theme-secondary-300", cn({
			"text-theme-danger-400": color === "danger",
			"text-theme-hint-500": color === "hint",
			"text-theme-primary-600": color === "info",
			"text-theme-success-600": color === "success",
			"text-theme-warning-600": color === "warning",
		}), props.className)} />
	)
