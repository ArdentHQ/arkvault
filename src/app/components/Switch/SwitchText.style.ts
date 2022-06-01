import tw from "twin.macro";

import { Size } from "@/types";

const baseStyle = tw`font-semibold select-none text-theme-secondary-500 dark:text-theme-secondary-700`;

const getSelected = (selected: boolean) => {
	if (selected) {
		return tw`text-theme-secondary-700 dark:text-theme-secondary-200`;
	}
};

const getVariant = (disabled: boolean) => {
	if (disabled) {
		return tw`cursor-default`;
	}
};

const getSize = (size?: Size) => {
	const sizes = {
		default: () => tw`text-base first:mr-3 last:ml-3`,
		lg: () => tw`text-lg first:mr-4 last:ml-4`,
		sm: () => tw`text-sm first:mr-2 last:ml-2`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (sizes[size as keyof typeof sizes] || sizes.default)();
};

export interface SwitchTextType {
	size?: Size;
	selected?: boolean;
	disabled?: boolean;
}
export const getSwitchTextStyles = ({ size, selected, disabled }: SwitchTextType) => [
	baseStyle,
	getSize(size),
	getSelected(selected!),
	getVariant(disabled!),
];
