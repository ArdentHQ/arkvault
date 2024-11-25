import cn from "classnames";
import React, { forwardRef } from "react";
import { Icon } from "@/app/components/Icon";
import { Position, Size } from "@/types";
import { twMerge } from "tailwind-merge";

interface BadgeProperties {
	className?: string;
	children?: React.ReactNode;
	icon?: string;
	iconClass?: string;
	iconSize?: Size;
	size?: Size;
	position?: Position;
	noShadow?: boolean;
}

interface BadgeStyleProperties extends React.HTMLAttributes<HTMLSpanElement> {
	position?: Position;
	size?: Size;
	noShadow?: boolean;
}

export const Wrapper = forwardRef<HTMLSpanElement, BadgeStyleProperties>(
	({ position, size, noShadow, ...props }, ref) => (
		<span
			ref={ref}
			className={twMerge(
				"absolute bottom-0 right-0 h-5 w-5 translate-x-1/2 translate-y-1/2 transform",
				cn({
					"bottom-0 left-0 -translate-x-1/2 translate-y-1/2": position === "bottom-left",
					"bottom-0 right-0 translate-x-1/2 translate-y-1/2": position === "bottom-right",
					"bottom-1 translate-y-full": position === "bottom",
					"left-1 -translate-x-full": position === "left",
					"right-1 translate-x-full": position === "right",
					"shadow-[0_0_0_3px_theme-background]": size === "sm" && !noShadow,
					"shadow-[0_0_0_5px_theme-background]": size !== "sm" && !noShadow,
					"left-0 top-0 -translate-x-1/2 -translate-y-1/2": position === "top-left",
					"right-0 top-0 -translate-y-1/2 translate-x-1/2": position === "top-right",
					"top-1 -translate-y-full": position === "top",
					"h-2 w-2": size === "sm",
					"h-6 w-6": size === "lg",
				}),
				props.className,
			)}
			{...props}
		/>
	),
);

Wrapper.displayName = "Wrapper";

export const Badge = forwardRef<HTMLSpanElement, BadgeProperties>(
	({ className, children, icon, iconClass, iconSize = "sm", ...properties }: BadgeProperties, reference) => (
		<Wrapper
			ref={reference}
			className={cn(
				"flex items-center justify-center rounded-full border-2 bg-theme-background align-middle",
				className,
			)}
			{...properties}
		>
			{!!icon && <Icon name={icon} className={iconClass} size={iconSize} />}
			<span>{children}</span>
		</Wrapper>
	),
);

Badge.displayName = "Badge";
