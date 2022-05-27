import React from "react";

export type TruncateMiddleDynamicProperties = {
	value: string;
	offset?: number;
	parentRef?: React.RefObject<HTMLElement>;
	tooltipDarkTheme?: boolean;
	availableWidth?: number;
} & React.HTMLProps<any>;
