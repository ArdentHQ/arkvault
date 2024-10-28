import React from "react";
import { getStyles } from "./Button.styles";
import { ButtonSpinner } from "@/app/components/ButtonSpinner";
import { Icon } from "@/app/components/Icon";
import { ButtonVariant, Size, Theme } from "@/types";
import { twMerge } from "tailwind-merge";
import cn from 'classnames';

type ButtonProperties = {
	variant?: ButtonVariant;
	theme?: Theme;
	size?: Size;
	roundedClassName?: string;
	sizeClassName?: string;
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
			roundedClassName,
			sizeClassName,
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
			roundedClassName,
			size,
			sizeClassName,
			theme,
			variant,
		});

		return (
			<button
				type={type}
				ref={reference}
				disabled={disabled}
				className={twMerge(
					"relative items-center inline-flex justify-center font-semibold leading-tight text-center transition-colors-shadow duration-100 ease-linear outline-none focus:outline-none focus:ring-2 focus:ring-theme-primary-400 disabled:cursor-not-allowed",
					cn(
						// Conditional styles based on `variant`
						{
							"rounded": !roundedClassName, // Apply default rounded class if not provided
							// Disabled state classes
							"disabled:text-theme-secondary-400 dark:disabled:text-theme-secondary-700": disabled && variant === "transparent",
							"disabled:bg-none disabled:text-theme-secondary-400 dark:disabled:text-theme-secondary-700": disabled && variant === "secondary-icon" && isCompact,
							"disabled:bg-theme-secondary-800 disabled:text-theme-secondary-700": disabled && theme === "dark",
							"disabled:bg-theme-secondary-200 disabled:text-theme-secondary-400 dark:disabled:bg-theme-secondary-800 dark:disabled:text-theme-secondary-700": disabled && !["transparent", "secondary-icon"].includes(variant) && theme !== "dark",
							// Variant classes
							"text-theme-primary-600 dark:text-theme-secondary-700 dark:ring-theme-secondary-800 ring-1 ring-inset ring-theme-secondary-300 hover:bg-theme-primary-700 hover:ring-0 hover:text-white": variant === "border",
							"bg-theme-danger-100 text-theme-danger-400 dark:bg-theme-danger-400 dark:text-white hover:bg-theme-danger-400 hover:text-white dark:hover:bg-theme-danger-500 focus:ring-theme-danger-300": variant === "danger",
							"border-none": !variant,
							"bg-theme-info-100 text-theme-info-600 dark:bg-theme-info-600 dark:text-white hover:bg-theme-info-700 hover:text-white focus:ring-theme-info-300": variant === "info",
							"text-white bg-theme-primary-600 hover:bg-theme-primary-700": variant === "primary",
							"bg-theme-primary-reverse-100 text-theme-primary-reverse-600 dark:bg-theme-primary-reverse-600 dark:text-white hover:bg-theme-primary-reverse-700 hover:text-white focus:ring-theme-primary-reverse-300": variant === "reverse",
							"dark:bg-theme-secondary-800 dark:text-theme-secondary-200 bg-theme-primary-100 text-theme-primary-600 hover:bg-theme-primary-700 hover:text-white dark:hover:bg-theme-primary-700": variant === "secondary",
							"text-theme-secondary-700 bg-transparent dark:text-theme-secondary-600 dark:bg-transparent": variant === "secondary-icon",
							"bg-theme-warning-100 text-theme-warning-700 dark:bg-theme-warning-600 dark:text-white hover:bg-theme-warning-700 hover:text-white focus:ring-theme-warning-300": variant === "warning",
							// Size classes
							"px-3 py-2 space-x-2 text-sm": size === "sm" && !sizeClassName,
							"px-6 py-4 space-x-4": size === "lg" && !sizeClassName,
							"p-3": size === "icon" && !sizeClassName,
							"px-5 py-3 space-x-3 text-base": !size && !sizeClassName,
						},
						// Custom classes
						className
					)
				)}
				{...properties}
			>
				<div className="flex items-center space-x-2">{renderContent()}</div>
			</button>
		);
	},
);

Button.displayName = "Button";
