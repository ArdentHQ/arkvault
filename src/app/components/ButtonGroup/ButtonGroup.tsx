import cn from "classnames";
import React from "react";
import { Tooltip } from "@/app/components/Tooltip";
import { twMerge } from "tailwind-merge";

export const ButtonGroup = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
	<div data-testid="ButtonGroup" role="radiogroup" className={twMerge("inline-flex w-full items-center", className)}>
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
			"border-theme-primary-100 text-theme-secondary-700 hover:border-theme-primary-100 hover:bg-theme-primary-100 hover:text-theme-primary-700 focus:ring-theme-primary-400 disabled:border-theme-secondary-300 disabled:text-theme-secondary-500 aria-checked:border-theme-primary-600 aria-checked:bg-theme-primary-50 aria-checked:text-theme-primary-700 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dark:hover:border-theme-secondary-800 dark:hover:bg-theme-secondary-800 dark:hover:text-theme-secondary-200 dark:disabled:border-theme-secondary-700 dark:disabled:text-theme-secondary-700 dark:aria-checked:border-theme-dark-400 dark:aria-checked:bg-theme-dark-800 dark:aria-checked:text-theme-dark-50 dim:text-theme-secondary-200 dim:border-theme-dim-700 dim-hover:border-theme-dim-700 dim-hover:bg-theme-dim-700 dim-hover:text-theme-dim-50 dim:aria-checked:bg-theme-dim-navy-950 dim:aria-checked:border-theme-navy-800 dim:aria-checked:text-theme-dim-50 flex h-full w-full cursor-pointer items-center justify-center border-2 p-3 font-semibold transition-colors duration-300 focus:ring-2 focus:outline-hidden disabled:cursor-not-allowed disabled:border dark:aria-checked:cursor-default",
			cn({
				"h-11 rounded-xl": variant === "modern",
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
	className?: string;
}

export const ButtonGroupOption = ({
	children,
	disabled,
	isSelected,
	setSelectedValue,
	tooltipContent,
	value,
	variant = "default",
	className,
}: ButtonGroupOptionProperties) => {
	/* istanbul ignore next -- @preserve */
	const label = tooltipContent ?? `${value ?? ""}`;

	const render = () => (
		<ButtonGroupOptionStyled
			className={className}
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
