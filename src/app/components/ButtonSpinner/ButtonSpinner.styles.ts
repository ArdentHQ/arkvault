import tw, { css, TwStyle } from "twin.macro";

import { SerializedStyles } from "@emotion/react";
import { ButtonVariant } from "@/types";
import { shouldUseDarkColors } from "@/utils/theme";

const baseStyle = tw`w-6 h-6 border border-4 rounded-full animate-spin`;

const variantColors: {
	[key in ButtonVariant]?: string;
} = {
	danger: "danger-400",
	primary: "white",
	secondary: "primary-600",
};

const getColor = (variant: ButtonVariant): (TwStyle | SerializedStyles)[] => {
	const color = variantColors[variant] || "primary-500";

	const borderColor = variant === "danger" && shouldUseDarkColors() ? "white" : color;
	const borderStyle = css`
		border-left-color: var(--theme-color-${borderColor}) !important;
	`;

	const variants = {
		danger: () => tw`border-theme-danger-200 dark:border-theme-danger-500`,
		default: () => tw`border-theme-secondary-200`,
		primary: () => tw`border-theme-primary-700`,
		secondary: () => tw`border-white dark:border-theme-secondary-900`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return [borderStyle, (variants[variant as keyof typeof variants] || variants.default)()];
};

export const getStyles = ({ variant }: { variant?: ButtonVariant }) => [baseStyle, getColor(variant!)];
