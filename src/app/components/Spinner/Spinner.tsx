import React from "react";
import { getStyles } from "./Spinner.styles";
import { Color, Size, Theme } from "@/types";
import { twMerge } from "tailwind-merge";

interface SpinnerType {
	color?: Color | "warning-alt";
	size?: Size;
	theme?: Theme;
	width?: number;
}

export const Spinner = ({ color, size, theme, width, ...props}: SpinnerType & React.HTMLProps<HTMLDivElement>) => (
		<div
			{...props}
			className={twMerge(getStyles({ color, size, theme, }), props.className)}
			style={{
				borderWidth: `${width}px !important`,
			}}
		/>
	)

Spinner.defaultProps = {
	color: "info",
};
