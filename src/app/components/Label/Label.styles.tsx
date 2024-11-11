import tw from "twin.macro";

import { LabelProperties } from "./Label";
import { Size } from "@/types";

const baseStyle = tw`inline-block font-semibold overflow-hidden`;

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
			danger: () => tw`text-theme-danger-500 border-theme-danger-100 bg-theme-danger-100`,
			default: () => tw`text-theme-warning-700 border-theme-warning-100 bg-theme-warning-100`,
			neutral: () => tw`text-theme-success-600 border-theme-success-200 bg-theme-success-200`,
			primary: () => tw`text-theme-primary-500 border-theme-primary-100 bg-theme-primary-100`,
			success: () => tw`text-theme-success-600 border-theme-success-200 bg-theme-success-200`,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (colors[color as keyof typeof colors] || colors.default)();
	}

	const colors = {
		danger: () => tw`text-theme-danger-400 border-theme-danger-100 dark:border-theme-danger-400`,
		"danger-bg": () =>
			tw`text-theme-danger-info-text bg-theme-danger-info-background dark:border dark:bg-transparent dark:border-theme-danger-info-border`,
		default: () => tw`text-theme-warning-700 border-theme-danger-100 dark:border-theme-warning-700`,
		neutral: () =>
			tw`text-theme-secondary-700 bg-theme-secondary-200 border-theme-secondary-200 dark:text-theme-secondary-500 dark:bg-transparent dark:border-theme-secondary-800`,
		primary: () => tw`text-theme-primary-500 border-theme-primary-100 dark:border-theme-primary-500`,
		secondary: () =>
			tw`text-theme-secondary-700 bg-theme-secondary-200 border-theme-secondary-200 dark:border-theme-secondary-800 dark:text-theme-secondary-500 dark:bg-transparent group-hover:bg-theme-secondary-300 dark:group-hover:bg-transparent`,
		success: () => tw`text-theme-success-600 border-theme-success-200 dark:border-theme-success-600`,
		"success-bg": () =>
			tw`bg-theme-success-100 text-theme-success-700 dark:border dark:border-theme-success-700 dark:bg-transparent dark:text-theme-success-500`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (colors[color as keyof typeof colors] || colors.default)();
};

const getSize = (size?: Size) => {
	if (size === "lg") {
		return tw`text-lg`;
	}

	if (size === "sm") {
		return tw`text-sm`;
	}

	if (size === "xs") {
		return tw`text-xs leading-[15px]`;
	}

	return tw`text-base`;
};

const getBorder = (noBorder?: boolean) => {
	if (!noBorder) {
		return tw`px-1 border-2 rounded`;
	}
};

export const getStyles = ({ color, size, variant, noBorder }: LabelProperties) => [
	baseStyle,
	getBorder(noBorder),
	getColor(color, variant),
	getSize(size),
];
