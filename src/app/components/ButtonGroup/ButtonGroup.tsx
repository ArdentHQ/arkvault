import cn from "classnames";
import React from "react";
import { Tooltip } from "@/app/components/Tooltip";
import { twMerge } from "tailwind-merge";

export const ButtonGroup = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
	<div data-testid="ButtonGroup" role="radiogroup" className={cn("inline-flex w-full items-center", className)}>
		{children}
	</div>
);

type ButtonGroupOptionVariant = "default" | "modern";

interface ButtonGroupOptionStyledProperties extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant: ButtonGroupOptionVariant;
}

const ButtonGroupOptionStyled = ({variant, ...props}: ButtonGroupOptionStyledProperties) => {
	return (
		<button className={
			twMerge(
				"flex items-center justify-center w-full h-full transition-colors duration-300 p-3 font-semibold text-theme-secondary-700 border-2 border-theme-primary-100 dark:border-theme-secondary-800 dark:text-theme-secondary-500 focus:outline-none focus:ring-2 focus:ring-theme-primary-400 disabled:border disabled:border-theme-secondary-300 disabled:text-theme-secondary-500 disabled:cursor-not-allowed disabled:dark:text-theme-secondary-700 disabled:dark:border-theme-secondary-700 hover:border-theme-primary-100 hover:text-theme-primary-700 hover:bg-theme-primary-100 dark:hover:border-theme-secondary-800 dark:hover:text-theme-secondary-200 dark:hover:bg-theme-secondary-800 checked:text-theme-primary-700 checked:border-theme-primary-600 checked:bg-theme-primary-50 dark:checked:bg-theme-primary-900 dark:checked:text-theme-primary-50 dark:checked:cursor-default",
				cn({
					"rounded": variant === "default",
					"h-14 rounded-xl": variant === "modern",
				}),
				props.className
			)
		} {...props} />
	)
}

interface ButtonGroupOptionProperties {
	children: React.ReactNode;
	disabled?: boolean;
	isSelected: (value: string | number) => boolean;
	setSelectedValue: (value: string | number) => void;
	tooltipContent?: string;
	value: string | number;
	variant?: ButtonGroupOptionVariant;
}

export const ButtonGroupOption = ({
	children,
	disabled,
	isSelected,
	setSelectedValue,
	tooltipContent,
	value,
	variant = "default",
}: ButtonGroupOptionProperties) => {
	/* istanbul ignore next -- @preserve */
	const label = tooltipContent ?? `${value ?? ""}`;

	const render = () => (
		<ButtonGroupOptionStyled
			aria-checked={isSelected(value)}
			aria-label={label}
			data-testid="ButtonGroupOption"
			disabled={disabled}
			onClick={() => setSelectedValue(value)}
			role="radio"
			type="button"
			variant={variant}
		>
			{children}
		</ButtonGroupOptionStyled>
	);

	if (tooltipContent) {
		return <Tooltip content={tooltipContent}>{render()}</Tooltip>;
	}

	return render();
};
