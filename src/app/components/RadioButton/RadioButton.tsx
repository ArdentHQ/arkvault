import React from "react";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

type RadioButtonProperties = {
	color?: Color;
} & React.InputHTMLAttributes<any>;

export const RadioButton = ({
	color = "success",
	...props
}: RadioButtonProperties & React.InputHTMLAttributes<any>) => (
	<input
		{...props}
		type="radio"
		className={twMerge(
			"h-4 w-4 cursor-pointer border-theme-secondary-300 transition duration-150 ease-in-out focus:ring-offset-0",
			cn({
				"text-theme-danger-400": color === "danger",
				"text-theme-hint-500": color === "hint",
				"text-theme-primary-600": color === "info",
				"text-theme-success-600": color === "success",
				"text-theme-warning-600": color === "warning",
			}),
			props.className,
		)}
	/>
);
