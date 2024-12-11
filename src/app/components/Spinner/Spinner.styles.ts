import { Color, Size, Theme } from "@/types";

const baseStyle = `animate-spin rounded-full border-[5px] flex-shrink-0`;

const getColor = (color: Color | "warning-alt", theme?: Theme) => {
	const baseColors: Record<Color | "warning-alt", string> = {
		danger: `border-l-theme-danger-400 dark:border-l-theme-danger-400`,
		hint: `border-l-theme-hint-500 dark:border-l-theme-hint-500`,
		info: `border-l-theme-primary-600 dark:border-l-theme-primary-600`,
		success: `border-l-theme-success-600 dark:border-l-theme-success-600`,
		warning: `border-l-theme-warning-600 dark:border-l-theme-warning-600`,
		"warning-alt": `border-l-theme-warning-900 dark:border-l-theme-warning-600`,
	};

	let styles =
		color === "warning-alt"
			? [`border-theme-warning-200 dark:border-theme-secondary-800`]
			: [`border-theme-secondary-200 dark:border-black`];

	if (theme === "dark") {
		styles = [`border-black`];
	}

	if (theme === "system") {
		styles = [`border-theme-primary-100 dark:border-theme-secondary-800`];
	}

	return [...styles, baseColors[color]].join(" ");
};

const getSize = (size?: Size) => {
	const sizes = {
		default: () => `w-8 h-8`,
		lg: () => `w-12 h-12`,
		sm: () => `w-5 h-5`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

export const getStyles = ({
	color,
	size,
	theme,
}: {
	color?: Color | "warning-alt";
	size?: Size;
	theme?: Theme;
}): string | string[] => [baseStyle, getSize(size), getColor(color!, theme)];
