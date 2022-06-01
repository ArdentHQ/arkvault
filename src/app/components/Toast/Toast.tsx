import React from "react";
import { styled } from "twin.macro";

import { getBodyStyles, getIconStyles } from "./Toast.styles";
import { Icon } from "@/app/components/Icon";

import { Color } from "@/types";

interface ToastProperties {
	children: React.ReactNode;
	variant?: Color;
}

const ToastIconWrapper = styled.div<ToastProperties>(getIconStyles);
const ToastBody = styled.div<ToastProperties>(getBodyStyles);

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
