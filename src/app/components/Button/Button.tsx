import React from "react";

import { getStyles } from "./Button.styles";
import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { Icon } from "@/app/components/Icon";
import { ButtonVariant, Size, Theme } from "@/types";
import { twMerge } from "tailwind-merge";

type ButtonProperties = {
	variant?: ButtonVariant;
	theme?: Theme;
	size?: Size;
	isLoading?: boolean;
	icon?: string;
	iconSize?: Size;
	iconPosition?: "left" | "right";
	isCompact?: boolean;
} & React.ButtonHTMLAttributes<any>;

export const Button = React.forwardRef<HTMLButtonElement, ButtonProperties>(
	(
		{
			variant = "primary",
			children,
			icon,
			isLoading,
			iconSize,
			iconPosition = "left",
			type = "button",
			size,
			theme,
			isCompact,
			disabled,
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

		const initialStyles = getStyles({
			disabled,
			isCompact,
			size,
			theme,
			variant,
		});

		return (
			<button
				type={type}
				ref={reference}
				disabled={disabled}
				className={twMerge(initialStyles, className)}
				{...properties}
			>
				<div className="flex items-center space-x-2">{renderContent()}</div>
			</button>
		);
	},
);

Button.displayName = "Button";
