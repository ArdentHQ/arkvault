import { LabelProperties } from "./Label";
import { Size } from "@/types";

const baseStyle = "inline-block font-semibold overflow-hidden no-ligatures";

export type ColorType =
	| "primary"
	| "success"
	| "danger"
	| "warning"
	| "neutral"
	| "success-bg"
	| "danger-bg"
	| "secondary";

const getColor = (color?: ColorType, variant?: string) => {
	if (variant === "solid") {
		const colors = {
			danger: () => `text-theme-danger-500 border-theme-danger-100 bg-theme-danger-100`,
			default: () => `text-theme-warning-700 border-theme-warning-100 bg-theme-warning-100`,
			neutral: () => `text-theme-success-600 border-theme-success-200 bg-theme-success-200`,
			primary: () => `text-theme-primary-500 border-theme-primary-100 bg-theme-primary-100`,
			success: () => `text-theme-success-600 border-theme-success-200 bg-theme-success-200`,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (colors[color as keyof typeof colors] || colors.default)();
	}

	const colors = {
		danger: () => `text-theme-danger-400 border-theme-danger-100 dark:border-theme-danger-400`,
		"danger-bg": () =>
			`text-theme-danger-info-text bg-theme-danger-info-background dark:border dark:bg-transparent dark:border-theme-danger-info-border dim:border-theme-danger-info-border dim:text-theme-danger-info-text`,
		default: () => `text-theme-warning-700 border-theme-danger-100 dark:border-theme-warning-700`,
		neutral: () =>
			`text-theme-secondary-700 bg-theme-secondary-200 border-theme-secondary-200 dark:text-theme-secondary-500 dark:bg-transparent dark:border-theme-secondary-800 dim:text-theme-dim-200 dim:bg-theme-dim-950 dim:border-theme-dim-950`,
		primary: () => `text-theme-primary-500 border-theme-primary-100 dark:border-theme-primary-500`,
		secondary: () =>
			`text-theme-secondary-700 bg-theme-secondary-200 border-theme-secondary-200 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dark:bg-transparent group-hover:bg-theme-secondary-300 dark:group-hover:bg-transparent dim:text-theme-dim-200 dim:border-theme-dim-700`,
		success: () =>
			`text-theme-success-600 border-theme-success-200 dark:border-theme-success-600 dim:border-theme-success-700 dim:text-theme-success-500`,
		"success-bg": () =>
			`bg-theme-success-100 text-theme-success-700 dark:border dark:border-theme-success-700 dark:bg-transparent dark:text-theme-success-500  dim:border-theme-success-700 dim:text-theme-success-500`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (colors[color as keyof typeof colors] || colors.default)();
};

const getSize = (size?: Size) => {
	if (size === "lg") {
		return `text-lg`;
	}

	if (size === "sm") {
		return `text-sm`;
	}

	if (size === "xs") {
		return `text-xs leading-[15px]`;
	}

	return `text-base`;
};

const getBorder = (noBorder?: boolean) => {
	if (!noBorder) {
		return `px-1 border-2 rounded`;
	}
};

export const getStyles = ({ color, size, variant, noBorder }: LabelProperties) => [
	baseStyle,
	getBorder(noBorder),
	getColor(color, variant),
	getSize(size),
];
