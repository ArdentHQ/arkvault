import tw, { TwStyle } from "twin.macro";
import { AlertLayout, Color } from "@/types";

const headerBaseStyle = tw`flex items-center`;
const bodyBaseStyle = tw`text-sm leading-relaxed break-words text-left `;

const getWrapperVariant = (layout?: AlertLayout, variant?: Color) => {
	if (layout === "horizontal") {
		const variants = {
			danger: () => tw`bg-theme-danger-50`,
			hint: () => tw`bg-theme-hint-50`,
			info: () => tw`bg-theme-info-50`,
			success: () => tw`bg-theme-success-50`,
			warning: () => tw`bg-theme-warning-50`,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (variants[variant as keyof typeof variants] || variants.warning)();
	}

	return "";
};

const getWrapperLayout = (layout?: AlertLayout) => {
	if (layout === "horizontal") {
		return tw`flex items-center justify-center overflow-hidden dark:bg-theme-secondary-800`;
	}

	return tw`flex flex-col overflow-hidden rounded-xl`;
};

const getHeaderVariant = (layout?: AlertLayout, variant?: Color) => {
	let variants: Record<Color, () => TwStyle>;

	if (layout === "horizontal") {
		variants = {
			danger: () => tw`text-theme-danger-900 bg-theme-danger-100 dark:bg-theme-danger-900 dark:text-white`,
			hint: () => tw`text-theme-hint-900 bg-theme-hint-100 dark:bg-theme-hint-900 dark:text-white`,
			info: () => tw`text-theme-info-900 bg-theme-info-100 dark:bg-theme-info-900 dark:text-white`,
			success: () => tw`text-theme-success-900 bg-theme-success-100 dark:bg-theme-success-900 dark:text-white`,
			warning: () => tw`text-theme-warning-900 bg-theme-warning-100 dark:bg-theme-warning-900 dark:text-white`,
		};
	} else {
		variants = {
			danger: () => tw`text-theme-danger-700 bg-theme-danger-100 dark:bg-theme-danger-500`,
			hint: () => tw`text-theme-hint-700 bg-theme-hint-100 dark:bg-theme-hint-700`,
			info: () => tw`text-theme-info-700 bg-theme-info-100 dark:bg-theme-info-700`,
			success: () => tw`text-theme-success-700 bg-theme-success-100 dark:bg-theme-success-700`,
			warning: () => tw`text-theme-warning-700 bg-theme-warning-100 dark:bg-theme-warning-700`,
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};

const getHeaderLayout = (layout?: AlertLayout) => {
	if (layout === "horizontal") {
		return tw`p-2 justify-center rounded`;
	}

	return tw`py-2 px-4 space-x-2 text-sm font-semibold dark:text-white`;
};

const getBodyVariant = (layout?: AlertLayout, variant?: Color) => {
	if (layout === "horizontal") {
		return "";
	}

	const variants = {
		danger: () => tw`bg-theme-danger-50`,
		hint: () => tw`bg-theme-hint-50`,
		info: () => tw`bg-theme-info-50`,
		success: () => tw`bg-theme-success-50`,
		warning: () => tw`bg-theme-warning-50`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};

const getBodyLayout = (layout?: AlertLayout) => {
	if (layout === "horizontal") {
		return tw`font-semibold px-2 py-4`;
	}

	return tw`w-full dark:bg-theme-secondary-800 p-4`;
};

const getWrapperStyles = ({ variant, layout }: { variant?: Color; layout?: AlertLayout }) => [
	getWrapperLayout(layout),
	getWrapperVariant(layout, variant),
];

const getHeaderStyles = ({ variant, layout }: { variant?: Color; layout?: AlertLayout }) => [
	headerBaseStyle,
	getHeaderLayout(layout),
	getHeaderVariant(layout, variant),
];

const getBodyStyles = ({ variant, layout }: { variant?: Color; layout?: AlertLayout }) => [
	bodyBaseStyle,
	getBodyLayout(layout),
	getBodyVariant(layout, variant),
];

export { getWrapperStyles, getBodyStyles, getHeaderStyles };
