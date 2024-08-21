import React from "react";
import { OnRefChangeType } from "react-resize-detector/build/types/types";

export type TruncateMiddleDynamicProperties = {
	value: string;
	offset?: number;
	parentRef?: React.RefObject<HTMLElement> | OnRefChangeType<HTMLElement>;
	tooltipDarkTheme?: boolean;
	availableWidth?: number;
} & React.HTMLProps<any>;
