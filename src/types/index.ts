import { TwStyle } from "twin.macro";

export type Color = "info" | "success" | "warning" | "danger" | "hint";

export type Size = "3xs" | "2xs" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "icon" | "avatarMobile";

export type LayoutBreakpoint = "sm" | "md" | "lg" | "xl";

export type Position =
	| "top"
	| "top-right"
	| "right"
	| "bottom-right"
	| "bottom"
	| "bottom-left"
	| "left"
	| "top-left"
	| "top-center";

export type ButtonVariant =
	| "primary"
	| "secondary"
	| "danger"
	| "warning"
	| "transparent"
	| "info"
	| "reverse"
	| "danger-icon";

export type ResponsiveButtonVariant = {
	[key in LayoutBreakpoint]?: ButtonVariant;
};

export type NavbarVariant = "full" | "logo-only";

export type Theme = "system" | "dark" | "light";

export interface TransactionFees {
	static: number;
	max: number;
	min: number;
	avg: number;
	isDynamic?: boolean;
}
export type ResponsiveButtonVariantStyles = {
	[key in LayoutBreakpoint]?: TwStyle;
};
