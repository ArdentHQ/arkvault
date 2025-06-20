import { UseComboboxGetItemPropsOptions } from "downshift";
import React, { JSX } from "react";

export interface OptionProperties {
	label: string;
	value: string | number;
	isSelected?: boolean;
}

export interface OptionGroupProperties {
	title: string;
	options: OptionProperties[];
}

export interface SelectDropdownItemProperties {
	item: OptionProperties;
	index: number;
	getItemProps: (options: UseComboboxGetItemPropsOptions<OptionProperties | null>) => any;
	highlightedIndex: number;
	inputValue: string;
	onMouseDown: (item: OptionProperties) => void;
	renderLabel?: (option: OptionProperties) => JSX.Element;
}

export interface SelectDropdownRenderOptionsProperties {
	data: OptionProperties[] | OptionGroupProperties[];
	getItemProps: (options: UseComboboxGetItemPropsOptions<OptionProperties | null>) => any;
	highlightedIndex: number;
	inputValue: string;
	onMouseDown: (item: OptionProperties) => void;
	renderLabel?: (option: OptionProperties) => JSX.Element;
}

export type SelectDropdownProperties = {
	addons?: any;
	options: OptionProperties[] | OptionGroupProperties[];
	mainOptions: OptionProperties[];
	defaultSelectedItem?: OptionProperties;
	placeholder?: string;
	innerClassName?: string;
	showCaret?: boolean;
	isInvalid?: boolean;
	showOptions?: boolean;
	disabled?: boolean;
	allowFreeInput?: boolean;
	onSelectedItemChange: any;
	renderLabel?: (option: OptionProperties) => JSX.Element;
	allowOverflow?: boolean;
} & React.InputHTMLAttributes<any>;

export interface SelectDropdownDropdownProperties {
	reference: React.RefObject<HTMLDivElement | null> | null;
	data: OptionProperties[] | OptionGroupProperties[];
	getItemProps: (options: UseComboboxGetItemPropsOptions<OptionProperties | null>) => any;
	highlightedIndex: number;
	inputValue: string;
	onMouseDown: (item: OptionProperties) => void;
	renderLabel: ((option: OptionProperties) => JSX.Element) | undefined;
	allowOverflow?: boolean;
}

export type SelectProperties = {
	addons?: any;
	options: OptionProperties[] | OptionGroupProperties[];
	defaultValue?: string;
	innerClassName?: string;
	isInvalid?: boolean;
	showCaret?: boolean;
	showOptions?: boolean;
	disabled?: boolean;
	allowFreeInput?: boolean;
	onChange?: (selected: OptionProperties) => void;
	renderLabel?: (option: OptionProperties) => JSX.Element;
	allowOverflow?: boolean;
	wrapperClassName?: string;
	ref?: React.Ref<HTMLInputElement>;
} & Omit<React.InputHTMLAttributes<any>, "onChange">;
