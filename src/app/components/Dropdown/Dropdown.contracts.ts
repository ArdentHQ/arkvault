import React from "react";

import { DefaultTReturn, TOptions } from "i18next";
import { Size } from "@/types";
import { Placement } from "@floating-ui/react";

export interface DropdownOption {
	icon?: string;
	iconPosition?: "start" | "end";
	iconClassName?: string | ((option: DropdownOption) => string);
	iconSize?: Size;
	label: string;
	secondaryLabel?: string | Function | DefaultTReturn<TOptions>;
	value: string | number;
	active?: boolean;
	[key: string]: any;
}

type OnSelectProperties = (option: DropdownOption) => void;

export interface DropdownOptionGroup {
	key: string;
	title?: string;
	hasDivider?: boolean;
	options: DropdownOption[];
	onSelect?: OnSelectProperties;
}

export interface OptionsProperties {
	options: DropdownOption[] | DropdownOptionGroup[];
	onSelect: OnSelectProperties;
	key?: string;
}

export type DropdownVariantType = "options" | "custom" | "votesFilter";

export interface DropdownProperties extends JSX.IntrinsicAttributes {
	as?: React.ElementType;
	children?: React.ReactNode;
	top?: React.ReactNode;
	onSelect?: OnSelectProperties;
	variant?: DropdownVariantType;
	options?: DropdownOption[] | DropdownOptionGroup[];
	position?: Placement;
	dropdownClass?: string;
	wrapperClass?: string;
	toggleIcon?: "Gear" | "ChevronDownSmall";
	toggleSize?: Size;
	toggleContent?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
	disableToggle?: boolean;
}
