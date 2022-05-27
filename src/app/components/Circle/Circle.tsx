import cn from "classnames";
import React, { forwardRef } from "react";
import { styled } from "twin.macro";

import { getStyles } from "./Circle.styles";
import { Size } from "@/types";

export type CircleProperties = {
	as?: React.ElementType;
	children?: React.ReactNode;
	avatarId?: string;
	size?: Size;
	className?: string;
	durationClassName?: string;
	shadowClassName?: string;
	noShadow?: boolean;
} & React.HTMLAttributes<any>;

const CircleWrapper = styled.div<CircleProperties>(getStyles);

export const Circle = forwardRef<HTMLDivElement, CircleProperties>(
	(
		{
			className,
			noShadow = false,
			shadowClassName,
			durationClassName,
			size,
			children,
			...properties
		}: CircleProperties,
		reference,
	) => (
		<CircleWrapper
			ref={reference}
			size={size}
			noShadow={!!noShadow}
			className={cn(className, shadowClassName || "ring-theme-background", durationClassName || "duration-100")}
			{...properties}
		>
			{children}
		</CircleWrapper>
	),
);

Circle.displayName = "Circle";
