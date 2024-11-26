import cn from "classnames";
import React, { forwardRef } from "react";
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
} & React.HTMLAttributes<any>;

const CircleWrapper = forwardRef<HTMLDivElement, CircleProperties>(
    ({ size, noShadow, children, avatarId, ...props }, ref) => (
            <div
                {...props}
                ref={ref}
                className={twMerge(
                    "transition-all inline-flex items-center justify-center align-middle border-2 rounded-full",
                    cn({
                        "border-0 bg-theme-info-200": avatarId,
                        "px-2 py-1 text-lg w-16 h-16": size === "xl",
                        "px-2 py-1 w-11 h-11": size === "lg",
                        "px-2 py-1 w-8 h-8 text-sm": size === "sm",
                        "ring-0": noShadow,
                        "ring-6": !noShadow,
                        "w-10 h-10 px-4 py-2": !size || !["lg", "sm", "xl", "xs"].includes(size),
                        "w-5 h-5 text-sm": size === "xs",
                    }),
                    props.className
                )}
            >
                {children}
            </div>
        )
);

CircleWrapper.displayName = "CircleWrapper";


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
