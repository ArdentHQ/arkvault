import { ColorType, getStyles } from "./Label.styles";
import { Size } from "@/types";
import { twMerge } from "tailwind-merge";
import React from "react";

export interface LabelProperties {
	color?: ColorType;
	size?: Size;
	variant?: "solid";
	noBorder?: boolean;
}

export const Label = ({
	color,
	size,
	variant,
	noBorder,
	...props
}: LabelProperties & React.HTMLAttributes<HTMLDivElement>) => (
	<span {...props} className={twMerge(getStyles({ color, noBorder, size, variant }), props.className)} />
);

Label.defaultProps = { color: "primary" };
