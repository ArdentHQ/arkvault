import cn from "classnames";
import React from "react";
import { Size } from "@/types";
import { twMerge } from "tailwind-merge";

export type CircleProperties = {
	as?: React.ElementType;
	children?: React.ReactNode;
	avatarId?: string;
	size?: Size;
	className?: string;
	durationClassName?: string;
	shadowClassName?: string;
	noShadow?: boolean;
	ref?: React.Ref<HTMLDivElement>;
} & React.HTMLAttributes<any>;

const CircleWrapper = ({ size, noShadow, children, avatarId, ...props }: CircleProperties) => (
	<div
		{...props}
		className={twMerge(
			"inline-flex items-center justify-center rounded-full border-2 align-middle transition-all",
			cn({
				"bg-theme-info-200 border-0": avatarId,
				"h-10 w-10 px-4 py-2": !size || !["lg", "sm", "xl", "xs"].includes(size),
				"h-11 w-11 px-2 py-1": size === "lg",
				"h-16 w-16 px-2 py-1 text-lg": size === "xl",
				"h-5 w-5 text-sm": size === "xs",
				"h-8 w-8 px-2 py-1 text-sm": size === "sm",
				"ring-0": noShadow,
				"ring-6": !noShadow,
			}),
			props.className,
		)}
	>
		{children}
	</div>
);

CircleWrapper.displayName = "CircleWrapper";

export const Circle = ({
	className,
	noShadow = false,
	shadowClassName,
	durationClassName,
	size,
	children,
	...properties
}: CircleProperties) => (
	<CircleWrapper
		size={size}
		noShadow={!!noShadow}
		className={cn(className, shadowClassName || "ring-theme-background", durationClassName || "duration-100")}
		{...properties}
	>
		{children}
	</CircleWrapper>
);

Circle.displayName = "Circle";
