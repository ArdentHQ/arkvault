import { ButtonVariant, Size, Theme } from "@/types";

const getBaseStyle = () => {
	const baseStyle: string[] = [
		`relative items-center inline-flex justify-center font-semibold leading-tight text-center transition-colors-shadow duration-100 ease-linear outline-none rounded`,
		`focus:outline-none focus:ring-2 focus:ring-theme-primary-400`,
		`disabled:cursor-not-allowed`,
	];

	return baseStyle;
};

const getVariant = (variant?: ButtonVariant, theme?: Theme, disabled?: boolean, isCompact?: boolean) => {
	if (disabled) {
		if (variant === "transparent") {
			return `disabled:text-theme-secondary-400 dark:disabled:text-theme-secondary-700`;
		}

		if (variant === "secondary-icon" && isCompact) {
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
		border: () => `
			text-theme-primary-600
			dark:text-theme-secondary-700
			dark:ring-theme-secondary-800
			ring-1
			ring-inset
			ring-theme-secondary-300
			hover:bg-theme-primary-700
			hover:ring-0
			hover:text-white
		`,
		danger: () => `
			bg-theme-danger-100 text-theme-danger-400
			dark:bg-theme-danger-400 dark:text-white
			hover:bg-theme-danger-400 hover:text-white dark:hover:bg-theme-danger-300
			focus:ring-theme-danger-300
		`,
		default: () => `border-none`,
		info: () => `
			bg-theme-info-100 text-theme-info-600
			dark:bg-theme-info-600 dark:text-white
			hover:bg-theme-info-700 hover:text-white
			focus:ring-theme-info-300
		`,
		primary: () => `text-white bg-theme-primary-600 green:hover:bg-theme-primary-700 navy:hover:bg-theme-primary-800 dark:hover:bg-theme-primary-500`,
		reverse: () => `
					bg-theme-primary-reverse-100 text-theme-primary-reverse-600
					dark:bg-theme-primary-reverse-600 dark:text-white
					hover:bg-theme-primary-reverse-700 hover:text-white
					focus:ring-theme-primary-reverse-300
				`,
		secondary: () => `dark:bg-theme-secondary-800 dark:text-theme-secondary-200
					bg-theme-primary-100 text-theme-primary-600
					hover:bg-theme-primary-800 green:hover:bg-theme-primary-700 hover:text-white
					dark:hover:bg-theme-primary-500
				`,
		"secondary-icon": () => `text-theme-secondary-700 bg-transparent
		dark:text-theme-secondary-600 dark:bg-transparent hover:text-theme-primary-700 hover:bg-theme-primary-200 dark:hover:text-white dark:hover:text-theme-secondary-800`,
		warning: () => `
			bg-theme-warning-100 text-theme-warning-700
			dark:bg-theme-warning-600 dark:text-white
			hover:bg-theme-warning-700 hover:text-white
			focus:ring-theme-warning-300
		`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return [(variants[variant as keyof typeof variants] || variants.default)()];
};

const getSize = (size?: Size) => {
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
	theme,
	size,
	disabled,
	isCompact,
}: {
	variant?: ButtonVariant;
	theme?: Theme;
	size?: Size;
	disabled?: boolean;
	isCompact?: boolean;
}) => [getSize(size), getBaseStyle(), getVariant(variant, theme, disabled, isCompact)];
