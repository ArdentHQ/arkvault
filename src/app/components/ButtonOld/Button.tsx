import React from "react";
import { styled } from "twin.macro";

import { getStyles } from "./Button.styles";
import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { Icon } from "@/app/components/Icon";
import { ButtonVariant, ResponsiveButtonVariant, LayoutBreakpoint, Size, Theme } from "@/types";

type ButtonProperties = {
	variant?: ButtonVariant;
	responsiveVariant?: ResponsiveButtonVariant;
	theme?: Theme;
	size?: Size;
	roundedClassName?: string;
	sizeClassName?: string;
	isLoading?: boolean;
	icon?: string;
	iconSize?: Size;
	iconPosition?: "left" | "right";
	showOn?: LayoutBreakpoint;
	isCompact?: boolean;
} & React.ButtonHTMLAttributes<any>;

const StyledButton = styled.button<ButtonProperties>(getStyles);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProperties>(
	(
		{
			variant = "primary",
			responsiveVariant,
			children,
			icon,
			isLoading,
			iconSize,
			iconPosition = "left",
			type = "button",
			showOn,
			roundedClassName,
			sizeClassName,
			className,
			...properties
		}: ButtonProperties,
		reference,
	) => {
		const renderContent = () => {
			if (isLoading) {
				return (
					<div className="flex items-center">
						<span className="invisible flex items-center space-x-2">
							<>
								{icon && <Icon name={icon} size={iconSize} />}
								{children}
							</>
						</span>

						<div className="absolute left-0 top-0 flex h-full w-full items-center justify-center">
							<ButtonSpinner variant={variant} />
						</div>
					</div>
				);
			}

			return (
				<>
					{icon && iconPosition === "left" && <Icon name={icon} size={iconSize} />}
					{children}
					{icon && iconPosition === "right" && <Icon name={icon} size={iconSize} />}
				</>
			);
		};

		const getClassName = () => [className, sizeClassName, roundedClassName].filter(Boolean).join(" ") || undefined;

		return (
			<StyledButton
				type={type}
				variant={variant}
				ref={reference}
				responsiveVariant={responsiveVariant}
				showOn={showOn}
				roundedClassName={roundedClassName}
				sizeClassName={sizeClassName}
				className={getClassName()}
				{...properties}
			>
				<div className="flex items-center space-x-2">{renderContent()}</div>
			</StyledButton>
		);
	},
);

Button.displayName = "Button";
