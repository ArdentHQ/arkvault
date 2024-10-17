import tw from "twin.macro";

import { DropdownVariantType } from "./Dropdown.contracts";

export const defaultClasses = "overflow-hidden bg-theme-background rounded-xl shadow-xl";

const getVariant = (variant: DropdownVariantType) => {
	if (variant === "options" || variant === "votesFilter") {
		return tw`dark:bg-theme-secondary-800 py-3`;
	}
};

export const getStyles = ({ variant }: { variant: DropdownVariantType }) => [
	getVariant(variant),
];
