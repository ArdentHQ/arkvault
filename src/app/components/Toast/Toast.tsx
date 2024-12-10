import React from "react";

import { getBodyStyles, getIconStyles } from "./Toast.styles";
import { Icon } from "@/app/components/Icon";
import { Color } from "@/types";
import { twMerge } from "tailwind-merge";

interface ToastProperties {
	children: React.ReactNode;
	variant?: Color;
}

const ToastIconWrapper = ({ variant, ...props }: ToastProperties) => {
	return <div {...props} className={twMerge(getIconStyles({variant}))} />;
}

const ToastBody = ({ variant, ...props }: ToastProperties) => {
	return <div {...props} className={twMerge(getBodyStyles({variant}))} />;
}

const ToastIcon = ({ variant }: { variant: string }) => {
	const iconVariant: Record<Color, string> = {
		danger: "CircleCross",
		hint: "CircleQuestionMark",
		info: "CircleInfo",
		success: "CircleCheckMark",
		warning: "CircleExclamationMark",
	};

	return <Icon name={iconVariant[variant]} />;
};

export const Toast = ({ variant = "warning", children }: ToastProperties) => (
	<div className="flex items-stretch overflow-hidden md:rounded-xl">
		<ToastIconWrapper variant={variant}>
			<ToastIcon variant={variant} />
		</ToastIconWrapper>

		<ToastBody variant={variant}>{children}</ToastBody>
	</div>
);
