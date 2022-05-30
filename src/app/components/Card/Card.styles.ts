import tw, { css, TwStyle } from "twin.macro";

import { ButtonVariant } from "@/types";

const baseStyle = [
	tw`bg-theme-background relative w-full h-full text-left transition-colors-shadow duration-200 p-5 border-2 border-theme-primary-100 dark:border-theme-secondary-800 rounded-lg cursor-default`,
	css`
		&.focus-visible {
			${tw`outline-none border-theme-primary-400!`}
		}
	`,
];

const getVariant = (variant?: ButtonVariant, onClick?: any) => {
	const styles = [tw`cursor-pointer outline-none`];

	const variants = {
		primary: () => {
			if (typeof onClick === "function") {
				return tw`hover:(bg-theme-primary-100 dark:bg-theme-secondary-800 dark:border-theme-secondary-800 border-theme-primary-100 shadow-xl)`;
			}
		},
		secondary: () => {
			if (typeof onClick === "function") {
				return tw`hover:(text-white bg-theme-primary-700 border-theme-primary-700 shadow-xl)`;
			}
		},
	};

	styles.push((variants[variant as keyof typeof variants] || variants.primary)() as TwStyle);

	return styles;
};

export const getStyles = ({ variant, onClick }: { variant?: ButtonVariant; onClick?: any }) => [
	baseStyle,
	getVariant(variant, onClick),
];
