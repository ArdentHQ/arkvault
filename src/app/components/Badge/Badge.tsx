import cn from "classnames";
import React, { forwardRef } from "react";
import { styled } from "twin.macro";

import { BadgeStyleProperties, defaultClasses, getStyles } from "./Badge.styles";
import { Icon } from "@/app/components/Icon";
import { Position, Size } from "@/types";

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

export const Wrapper = styled.span<BadgeStyleProperties>(getStyles);

export const Badge = forwardRef<HTMLSpanElement, BadgeProperties>(
	({ className, children, icon, iconClass, iconSize = "sm", ...properties }: BadgeProperties, reference) => (
		<Wrapper ref={reference} className={cn(defaultClasses, className)} {...properties}>
			{!!icon && <Icon name={icon} className={iconClass} size={iconSize} />}
			<span>{children}</span>
		</Wrapper>
	),
);

Badge.displayName = "Badge";
