import React from "react";

interface ListDividedItemProperties {
	isFloatingLabel?: boolean;
	label?: string;
	labelClass?: string;
	labelHeaderClass?: string;
	labelWrapperClass?: string;
	labelDescription?: string;
	labelDescriptionClass?: string;
	labelAddon?: React.ReactNode;
	value?: React.ReactNode;
	itemValueClass?: string;
	content?: React.ReactNode;
	contentClass?: string;
	wrapperClass?: string;
}

export type { ListDividedItemProperties };
