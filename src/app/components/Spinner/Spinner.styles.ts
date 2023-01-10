import tw, { css } from "twin.macro";

import { Color, Size } from "@/types";

const baseStyle = tw`animate-spin rounded-full border border-width[5px] flex-shrink-0`;

export type SpinnerTheme = "dark" | "system";

const getColor = (color: Color, theme?: SpinnerTheme) => {
	const baseColors: Record<Color, string> = {
		danger: "danger-400",
		hint: "hint-500",
		info: "primary-600",
		success: "success-600",
		warning: "warning-600",
	};

	return [
		theme === "dark" && tw`border-black`,
		theme === "system" && tw`border-theme-primary-100 dark:border-theme-secondary-800`,
		!theme && tw`border-theme-secondary-200 dark:border-black`,
		css`
			border-left-color: var(--theme-color-${baseColors[color]}) !important;
		`,
	];
};

const getSize = (size?: Size) => {
	const sizes = {
		default: () => tw`w-8 h-8`,
		lg: () => tw`w-12 h-12`,
		sm: () => tw`w-5 h-5`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

const getWidth = (width?: number) => {
	if (width !== null) {
		return css`
			border-width: ${width}px !important;
		`;
	}
};

export const getStyles = ({
	color,
	size,
	theme,
	width,
}: {
	color?: Color;
	size?: Size;
	theme?: SpinnerTheme;
	width?: number;
}) => [baseStyle, getSize(size), getColor(color!, theme), getWidth(width)];
