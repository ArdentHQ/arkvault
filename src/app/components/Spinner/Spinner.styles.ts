import tw, { TwStyle, css } from "twin.macro";

import { Color, Size, Theme } from "@/types";

const baseStyle = tw`animate-spin rounded-full border [border-width:5px] flex-shrink-0`;

const getColor = (color: Color | "warning-alt", theme?: Theme) => {
	const baseColors: Record<Color | "warning-alt", TwStyle> = {
		danger: tw`border-l-theme-danger-400 dark:border-l-theme-danger-400`,
		hint: tw`border-l-theme-hint-500 dark:border-l-theme-hint-500`,
		info: tw`border-l-theme-primary-600 dark:border-l-theme-primary-600`,
		success: tw`border-l-theme-success-600 dark:border-l-theme-success-600`,
		warning: tw`border-l-theme-warning-600 dark:border-l-theme-warning-600`,
		"warning-alt": tw`border-l-theme-warning-900 dark:border-l-theme-warning-600`,
	};

	let styles =
		color === "warning-alt"
			? [tw`border-theme-warning-200 dark:border-theme-secondary-800`]
			: [tw`border-theme-secondary-200 dark:border-black`];

	if (theme === "dark") {
		styles = [tw`border-black`];
	}

	if (theme === "system") {
		styles = [tw`border-theme-primary-100 dark:border-theme-secondary-800`];
	}

	return [...styles, baseColors[color]];
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
	if (width !== undefined) {
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
	color?: Color | "warning-alt";
	size?: Size;
	theme?: Theme;
	width?: number;
}) => [baseStyle, getSize(size), getColor(color!, theme), getWidth(width)];
