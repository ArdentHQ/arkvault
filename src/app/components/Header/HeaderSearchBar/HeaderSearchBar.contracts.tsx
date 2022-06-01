import React from "react";

export interface HeaderSearchBarProperties {
	offsetClassName?: string;
	placeholder?: string;
	label?: string;
	noToggleBorder?: boolean;
	onSearch?: (query: string) => void;
	onReset?: () => void;
	extra?: React.ReactNode;
	maxLength?: number;
	debounceTimeout?: number;
	defaultQuery?: string;
	resetFields?: boolean;
}
