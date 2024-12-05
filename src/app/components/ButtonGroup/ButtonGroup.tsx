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

const ButtonGroupOptionStyled = ({ variant, ...props }: ButtonGroupOptionStyledProperties) => (
	<button
		{...props}
		className={twMerge(
			"flex h-full w-full items-center justify-center border-2 border-theme-primary-100 p-3 font-semibold text-theme-secondary-700 transition-colors duration-300 checked:border-theme-primary-600 checked:bg-theme-primary-50 checked:text-theme-primary-700 hover:border-theme-primary-100 hover:bg-theme-primary-100 hover:text-theme-primary-700 focus:outline-none focus:ring-2 focus:ring-theme-primary-400 disabled:cursor-not-allowed disabled:border disabled:border-theme-secondary-300 disabled:text-theme-secondary-500 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dark:checked:cursor-default dark:checked:bg-theme-primary-900 dark:checked:text-theme-primary-50 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800 dark:hover:text-theme-secondary-200 disabled:dark:border-theme-secondary-700 disabled:dark:text-theme-secondary-700",
			cn({
				"h-14 rounded-xl": variant === "modern",
				rounded: variant === "default",
			}),
			props.className,
		)}
	/>
);

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
