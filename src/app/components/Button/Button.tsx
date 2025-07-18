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
	ref?: React.Ref<HTMLButtonElement>;
} & React.ButtonHTMLAttributes<any>;

export const Button = ({
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
	ref,
	...properties
}: ButtonProperties) => {
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

					<div className="absolute top-0 left-0 flex h-full w-full items-center justify-center">
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
		<button type={type} ref={ref} disabled={disabled} className={twMerge(initialStyles, className)} {...properties}>
			<div className="flex items-center gap-2">{renderContent()}</div>
		</button>
	);
};
