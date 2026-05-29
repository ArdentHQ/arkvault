import React, { RefObject } from "react";
import { OnRefChangeType } from "react-resize-detector/build/types/types";

export type TruncateMiddleDynamicProperties = {
	value: string;
	offset?: number;
	parentRef?: RefObject<HTMLElement> | OnRefChangeType<HTMLElement> | RefObject<null>;
	availableWidth?: number;
	showTooltip?: boolean;
} & React.HTMLProps<any>;
