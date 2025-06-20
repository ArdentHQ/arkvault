import React, { ReactElement, JSX } from "react";

import { DefaultTReturn, TOptions } from "i18next";
import { Size } from "@/types";
import { Placement } from "@floating-ui/react";

export interface DropdownOption {
	icon?: string;
	iconPosition?: "start" | "end";
	iconClassName?: string | ((option: DropdownOption) => string);
	iconSize?: Size;
	label: string;
	element?: ReactElement;
	secondaryLabel?: string | Function | DefaultTReturn<TOptions>;
	value: string | number;
	active?: boolean;
	[key: string]: any;
	disableFocus?: boolean;
}

type OnSelectProperties = (option: DropdownOption) => void;

export interface DropdownOptionGroup {
	key: string;
	title?: string;
	hasDivider?: boolean;
	options: DropdownOption[];
	onSelect?: OnSelectProperties;
	variant?: DropdownVariantType;
}

export interface OptionsProperties {
	options: DropdownOption[] | DropdownOptionGroup[];
	onSelect: OnSelectProperties;
	key?: string;
	variant?: DropdownVariantType;
}

export type DropdownVariantType = "options" | "custom" | "votesFilter" | "navbar";

export interface DropdownProperties extends JSX.IntrinsicAttributes {
	as?: React.ElementType;
	children?: React.ReactElement;
	top?: React.ReactNode;
	bottom?: React.ReactNode;
	onSelect?: OnSelectProperties;
	variant?: DropdownVariantType;
	options?: DropdownOption[] | DropdownOptionGroup[];
	placement?: Placement;
	wrapperClass?: string;
	toggleIcon?: "Gear" | "ChevronDownSmall";
	toggleSize?: Size;
	toggleContent?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
	disableToggle?: boolean;
	closeOnSelect?: boolean;
}
