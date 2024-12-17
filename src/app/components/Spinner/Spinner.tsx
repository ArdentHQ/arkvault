import React from "react";
import { getStyles } from "./Spinner.styles";
import { Color, Size, Theme } from "@/types";
import { twMerge } from "tailwind-merge";

interface SpinnerType extends React.HTMLAttributes<HTMLDivElement> {
	color?: Color | "warning-alt";
	size?: Size;
	theme?: Theme;
	width?: number;
}

export const Spinner = ({ color = "info", size, theme, width, ...props }: SpinnerType) => (
	<div
		{...props}
		className={twMerge(getStyles({ color, size, theme }), props.className)}
		css={{
			borderWidth: `${width}px !important`,
		}}
	/>
);
