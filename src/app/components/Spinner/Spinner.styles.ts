import tw, { css } from "twin.macro";

import { Color, Size, Theme } from "@/types";

const baseStyle = tw`animate-spin rounded-full border border-width[5px] flex-shrink-0`;

const getColor = (color: Color, theme?: Theme) => {
	const baseColors: Record<Color, string> = {
		danger: "danger-400",
		hint: "hint-500",
		info: "primary-600",
		success: "success-600",
		warning: "warning-600",
	};

	return [
			theme === "dark" ? tw`border-black` : tw`border-theme-secondary-200 dark:border-black`,
			css`
			border-left-color: var(--theme-color-${baseColors[color]}) !important;
		`,
	]
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

export const getStyles = ({ color, size, theme }: { color?: Color; size?: Size, theme?: Theme }) => [
	baseStyle,
	getSize(size),
	getColor(color!, theme),
];
