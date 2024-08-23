import tw from "twin.macro";

import { LabelProperties } from "./Label";
import { Size } from "@/types";

const baseStyle = tw`inline-block font-semibold overflow-hidden`;

export type ColorType = "primary" | "success" | "danger" | "warning" | "neutral" | "success-bg" | "danger-bg";

const getColor = (color?: ColorType, variant?: string) => {
	if (variant === "solid") {
		const colors = {
			danger: () => tw`text-theme-danger-500 border-theme-danger-100 bg-theme-danger-100`,
			default: () => tw`text-theme-warning-700 border-theme-warning-100 bg-theme-warning-100`,
			primary: () => tw`text-theme-primary-500 border-theme-primary-100 bg-theme-primary-100`,
			success: () => tw`text-theme-success-600 border-theme-success-200 bg-theme-success-200`,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (colors[color as keyof typeof colors] || colors.default)();
	}

	const colors = {
		danger: () => tw`text-theme-danger-400 border-theme-danger-100 dark:border-theme-danger-400`,
		"danger-bg": () =>
			tw`text-[#A56D4C] bg-[#FBEED6] dark:border dark:text-[#F39B9B] dark:bg-transparent dark:border-[#AA6868]`,
		default: () => tw`text-theme-warning-700 border-theme-danger-100 dark:border-theme-warning-700`,
		neutral: () =>
			tw`text-theme-secondary-900 border-theme-secondary-200 dark:text-theme-secondary-600 dark:border-theme-secondary-600`,
		primary: () => tw`text-theme-primary-500 border-theme-primary-100 dark:border-theme-primary-500`,
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
