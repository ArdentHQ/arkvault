import cn from "classnames";
import React from "react";
import tw, { css, styled } from "twin.macro";

import { Tooltip } from "@/app/components/Tooltip";

export const ButtonGroup = ({ children, className }: React.PropsWithChildren<{ className?: string }>) => (
	<div data-testid="ButtonGroup" role="radiogroup" className={cn("inline-flex w-full items-center", className)}>
		{children}
	</div>
);

type ButtonGroupOptionVariant = "default" | "modern";

const ButtonGroupOptionStyled = styled.button<{ variant: ButtonGroupOptionVariant }>(({ variant }) => {
	let styles = [
		tw`flex items-center justify-center w-full h-full transition-colors duration-300`,
		tw`p-3 font-semibold text-theme-secondary-700`,
		tw`border-2 border-theme-primary-100`,
		tw`dark:(border-theme-secondary-800 text-theme-secondary-500)`,
		tw`focus:(outline-none ring-2 ring-theme-primary-400)`,
		tw`disabled:(
			border border-theme-secondary-300 text-theme-secondary-500 cursor-not-allowed
			dark:(text-theme-secondary-700 border-theme-secondary-700)
		)`,
		tw`hover:(border-theme-primary-100 text-theme-primary-700 bg-theme-primary-100)`,
		tw`dark:hover:(border-theme-secondary-800 text-theme-secondary-200 bg-theme-secondary-800)`,
		css`
			&[aria-checked="true"] {
				${tw`text-theme-primary-700 border-theme-primary-600 bg-theme-primary-50 dark:bg-theme-primary-900 dark:text-theme-primary-50 cursor-default`}
			}
		`,
	];

	if (variant === "default") {
		styles = [...styles, tw`rounded`];
	}

	if (variant === "modern") {
		styles = [...styles, tw`h-14 rounded-xl`];
	}

	return styles;
});

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
