/* eslint-disable sonarjs/cognitive-complexity */
import {
	ButtonVariant,
	LayoutBreakpoint,
	ResponsiveButtonVariant, ResponsiveButtonVariantStyles,
	Size,
	Theme,
} from "@/types";

const getBaseStyle = (showOn?: LayoutBreakpoint, roundedClassName?: string) => {
	const baseStyle: string[] = [
		`relative items-center justify-center font-semibold leading-tight text-center transition-colors-shadow duration-100 ease-linear outline-none`,
		`focus:outline-none focus:ring-2 focus:ring-theme-primary-400`,
		`disabled:cursor-not-allowed`
	];

	if (!roundedClassName) {
		baseStyle.push(`rounded`);
	}

	const display: Record<LayoutBreakpoint, string> = {
		lg: `hidden lg:inline-flex`,
		md: `hidden md:inline-flex`,
		sm: `hidden sm:inline-flex`,
		xl: `hidden xl:inline-flex`,
	};

	if (showOn === undefined) {
		baseStyle.push(`inline-flex`);
	} else {
		baseStyle.push(display[showOn]);
	}

	return baseStyle;
};

const getResponsiveVariant = (
	responsiveStyles: ResponsiveButtonVariantStyles,
	breakpoint?: LayoutBreakpoint,
	defaultStyle?: string,
) => {
	if (breakpoint !== undefined) {
		return responsiveStyles[breakpoint];
	}

	return defaultStyle;
};

const getVariant = (
	variant?: ButtonVariant,
	responsiveVariant?: ResponsiveButtonVariant,
	theme?: Theme,
	disabled?: boolean,
	isCompact?: boolean,
) => {
	if (disabled) {
		if (variant === "transparent") {
			return `disabled:text-theme-secondary-400 dark:disabled:text-theme-secondary-700`;
		}

		if (variant === "danger-icon" && isCompact) {
			return `disabled:bg-none disabled:text-theme-secondary-400 dark:disabled:text-theme-secondary-700`;
		}

		if (theme === "dark") {
			return `disabled:bg-theme-secondary-800 disabled:text-theme-secondary-700`;
		}

		return `disabled:bg-theme-secondary-200 disabled:text-theme-secondary-400 dark:disabled:bg-theme-secondary-800 dark:disabled:text-theme-secondary-700`;
	}

	// The following methods optionally receive a breakpoint. We can use
	// that breakpoint to return a variant for a specific layout size, so we
	// can have "responsive" styles for the buttons.
	// Notice that it is only defining the responsive variants that are being
	// used in the project (@see `const responsive` definition inside `danger`
	// method as an example). We should add more breakpoints + tw classes as needed.
	const variants = {
		danger: () => `
			bg-theme-danger-100 text-theme-danger-400
			dark:bg-theme-danger-400 dark:text-white
			hover:bg-theme-danger-400 hover:text-white dark:hover:bg-theme-danger-500
			focus:ring-theme-danger-300
		`,
		"danger-icon": (breakpoint?: LayoutBreakpoint) => {
			const responsive: {
				[key in LayoutBreakpoint]?: string;
			} = {
				md: `
					md:text-theme-danger-400 md:bg-transparent
					md:dark:(text-theme-danger-400 bg-transparent)
					md:hover:(text-theme-danger-500 bg-transparent dark:text-theme-danger-500 dark:bg-transparent)
					md:focus:ring-theme-danger-300
				`,
			};

			return getResponsiveVariant(
				responsive,
				breakpoint,
				`
				text-theme-danger-400 bg-transparent
				dark:text-theme-danger-400 dark:bg-transparent
				hover:(text-theme-danger-500 bg-transparent)
				focus:ring-theme-danger-300
			`,
			);
		},
		default: () => `border-none`,
		info: () => `
			bg-theme-info-100 text-theme-info-600
			dark:(bg-theme-info-600 text-white)
			hover:(bg-theme-info-700 text-white)
			focus:ring-theme-info-300
		`,
		primary: () => `text-white bg-theme-primary-600 hover:bg-theme-primary-700`,
		reverse: () => `
					bg-theme-primary-reverse-100 text-theme-primary-reverse-600
					dark:bg-theme-primary-reverse-600 dark:text-white
					hover:bg-theme-primary-reverse-700 hover:text-white
					focus:ring-theme-primary-reverse-300
				`,
		secondary: () => `dark:bg-theme-secondary-800 dark:text-theme-secondary-200
					bg-theme-primary-100 text-theme-primary-600
					hover:bg-theme-primary-700 hover:text-white
				`,
		warning: () => `
			bg-theme-warning-100 text-theme-warning-700
			dark:(bg-theme-warning-600 text-white)
			hover:(bg-theme-warning-700 text-white)
			focus:ring-theme-warning-300
		`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const variantStyle = [(variants[variant as keyof typeof variants] || variants.default)()];

	for (const breakpoint of ["sm", "md", "lg", "xl"] as LayoutBreakpoint[]) {
		const breakpointVariant = responsiveVariant === undefined ? undefined : responsiveVariant[breakpoint];

		if (breakpointVariant === undefined) {
			continue;
		}

		const breakpointVariantStyle = variants[breakpointVariant as keyof typeof variants](breakpoint);
		variantStyle.push(breakpointVariantStyle);
	}

	return variantStyle;
};

const getSize = (size?: Size, sizeClassName?: string) => {
	if (sizeClassName) {
		return;
	}

	const sizes = {
		default: () => `px-5 py-3 space-x-3 text-base`,
		icon: () => `p-3`,
		lg: () => `px-6 py-4 space-x-4`,
		sm: () => `px-3 py-2 space-x-2 text-sm`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

export const getStyles = ({
	variant,
	responsiveVariant,
	theme,
	size,
	disabled,
	showOn,
	roundedClassName,
	sizeClassName,
	isCompact,
}: {
	variant?: ButtonVariant;
	responsiveVariant?: ResponsiveButtonVariant;
	theme?: Theme;
	size?: Size;
	sizeClassName?: string;
	disabled?: boolean;
	showOn?: LayoutBreakpoint;
	roundedClassName?: string;
	isCompact?: boolean;
}) => [
	getSize(size, sizeClassName),
	getBaseStyle(showOn, roundedClassName),
	getVariant(variant, responsiveVariant, theme, disabled, isCompact),
];
