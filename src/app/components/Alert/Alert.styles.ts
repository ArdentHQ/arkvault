import tw from "twin.macro";
import { Color } from "@/types";

export type AlertColor = Color | "danger-dark";

const chevronBaseStyle = tw`transform !ml-auto duration-100 transition-transform`;
const headerBaseStyle = tw`flex items-center py-2 px-4 space-x-2 text-sm font-semibold dark:text-white`;
const bodyBaseStyle = tw`w-full p-4 text-sm leading-relaxed break-words text-left dark:bg-theme-secondary-800`;

const getHeaderVariant = (variant?: AlertColor) => {
	const variants = {
		"danger-dark": () => tw`text-white bg-theme-danger-500`,
		danger: () => tw`text-theme-danger-700 bg-theme-danger-100 dark:bg-theme-danger-500`,
		hint: () => tw`text-theme-hint-700 bg-theme-hint-100 dark:bg-theme-hint-700`,
		info: () => tw`text-theme-info-700 bg-theme-info-100 dark:bg-theme-info-700`,
		success: () => tw`text-theme-success-700 bg-theme-success-100 dark:bg-theme-success-700`,
		warning: () => tw`text-theme-warning-700 bg-theme-warning-100 dark:bg-theme-warning-700`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};

const getBodyVariant = (variant?: AlertColor) => {
	const variants = {
		"danger-dark": () => tw`bg-theme-secondary-800 text-theme-secondary-200`,
		danger: () => tw`bg-theme-danger-50`,
		hint: () => tw`bg-theme-hint-50`,
		info: () => tw`bg-theme-info-50`,
		success: () => tw`bg-theme-success-50`,
		warning: () => tw`bg-theme-warning-50`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};
const getChevronVariant = (variant?: AlertColor) => {
	const variants = {
		"danger-dark": () => tw`text-white`,
		danger: () => tw`text-theme-danger-700 dark:text-white`,
		hint: () => tw`text-theme-hint-700 dark:text-white`,
		info: () => tw`text-theme-info-700 dark:text-white`,
		success: () => tw`text-theme-success-700 dark:text-white`,
		warning: () => tw`text-theme-warning-700 dark:text-white`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};

const getHeaderStyles = ({ variant, collapsible }: { variant?: AlertColor; collapsible?: boolean }) => [
	headerBaseStyle,
	getHeaderVariant(variant),
	collapsible === true && tw`cursor-pointer`,
];
const getBodyStyles = ({ variant }: { variant?: AlertColor }) => [bodyBaseStyle, getBodyVariant(variant)];
const getChevronProperties = ({ variant, collapsed }: { variant?: AlertColor; collapsed: boolean }) => [
	chevronBaseStyle,
	collapsed ? tw`rotate-0` : tw`rotate-180`,
	getChevronVariant(variant),
];

export { getBodyStyles, getHeaderStyles, getChevronProperties };
