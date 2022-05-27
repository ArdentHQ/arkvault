import tw from "twin.macro";

import { DropdownVariantType } from "./Dropdown.contracts";
import { Position } from "@/types";

export const defaultClasses = "mt-3 py-3 absolute z-10 bg-theme-background rounded-xl shadow-xl";

const getVariant = (variant: DropdownVariantType) => {
	if (variant === "options" || variant === "votesFilter") {
		return tw`dark:bg-theme-secondary-800`;
	}

	return tw`border-2 border-theme-primary-100 dark:border-theme-secondary-800`;
};

const getPosition = (position?: Position) => {
	const positions = {
		bottom: () => tw`bottom-0`,
		"bottom-left": () => tw`bottom-0 left-0 right-0 sm:right-auto`,
		default: () => tw`right-0 left-0 sm:left-auto`,
		left: () => tw`left-0 right-0 sm:right-auto`,
		top: () => tw`top-0`,
		"top-center": () => tw`left-0 right-0 transform-none sm:right-auto sm:left-1/2 sm:-translate-x-1/2`,
		"top-left": () => tw`top-0 left-0 right-auto sm:right-auto`,
		"top-right": () => tw`top-0 right-0 left-auto sm:left-auto`,
	};

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	return (positions[position as keyof typeof positions] || positions.default)();
};

export const getStyles = ({ position, variant }: { position?: Position; variant: DropdownVariantType }) => [
	getVariant(variant),
	getPosition(position),
];
