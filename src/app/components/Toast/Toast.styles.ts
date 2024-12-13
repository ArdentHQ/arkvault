import { Color } from "@/types";

const iconBaseStyle = "flex items-center px-4 justify-center dark:text-white";
const bodyBaseStyle =
	"w-full py-3 px-4 text-sm leading-relaxed break-words overflow-hidden text-left dark:bg-theme-secondary-800";

const getIconVariant = (variant?: Color) => {
	const variants = {
		danger: () => "text-theme-danger-700 bg-theme-danger-100 dark:bg-theme-danger-500",
		hint: () => "text-theme-hint-700 bg-theme-hint-100 dark:bg-theme-hint-700",
		info: () => "text-theme-info-700 bg-theme-info-100 dark:bg-theme-info-700",
		success: () => "text-theme-success-700 bg-theme-success-100 dark:bg-theme-success-700",
		warning: () => "text-theme-warning-700 bg-theme-warning-100 dark:bg-theme-warning-700",
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};

const getBodyVariant = (variant?: Color) => {
	const variants = {
		danger: () => "bg-theme-danger-50",
		hint: () => "bg-theme-hint-50",
		info: () => "bg-theme-info-50",
		success: () => "bg-theme-success-50",
		warning: () => "bg-theme-warning-50",
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (variants[variant as keyof typeof variants] || variants.warning)();
};

const getIconStyles = ({ variant }: { variant?: Color }) => [iconBaseStyle, getIconVariant(variant)];
const getBodyStyles = ({ variant }: { variant?: Color }) => [bodyBaseStyle, getBodyVariant(variant)];

export { getIconStyles, getBodyStyles };
