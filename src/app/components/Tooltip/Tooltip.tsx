import Tippy, { TippyProps } from "@tippyjs/react";
import cn from "classnames";
import React from "react";

import { getStyles } from "./Tooltip.styles";
import { useTheme } from "@/app/hooks";
import { Size } from "@/types";

export type TooltipProperties = {
	size?: Size;
} & TippyProps;

export const Tooltip: React.FC<TooltipProperties> = ({ size, theme, ...properties }) => {
	const themeOptions = useTheme();
	if (!properties.content) {
		return <>{properties.children}</>;
	}
	return (
		<Tippy
			maxWidth={600}
			theme={theme || themeOptions.theme}
			{...properties}
			className={cn(getStyles(size), properties.className)}
		/>
	);
};
