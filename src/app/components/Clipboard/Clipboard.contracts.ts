import React from "react";
import { ButtonVariant } from "@/types";

interface ClipboardCommonProperties {
	data: string | object;
	options?: Record<string, any>;
	children: React.ReactNode;
	disabled?: boolean;
}

export type ClipboardButtonProperties = ClipboardCommonProperties & {
	variant: "button";
	buttonVariant?: ButtonVariant;
	wrapperClassName?: string;
} & React.ButtonHTMLAttributes<any>;

export type ClipboardIconProperties = ClipboardCommonProperties & {
	variant: "icon";
	tooltip?: string;
	tooltipDarkTheme?: boolean;
};

export type ClipboardProperties = ClipboardIconProperties | ClipboardButtonProperties;
