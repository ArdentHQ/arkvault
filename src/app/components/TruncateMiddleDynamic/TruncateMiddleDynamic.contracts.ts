import React, { RefObject } from "react";
import { UseResizeDetectorReturn } from "react-resize-detector"

type OnRefChangeType<T> = UseResizeDetectorReturn<T>["ref"];

export type TruncateMiddleDynamicProperties = {
	value: string;
	offset?: number;
	parentRef?: RefObject<HTMLElement> | OnRefChangeType<HTMLElement> | RefObject<null>;
	availableWidth?: number;
	showTooltip?: boolean;
} & React.HTMLProps<any>;
