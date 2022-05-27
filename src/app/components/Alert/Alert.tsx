import cn from "classnames";
import React from "react";
import { styled } from "twin.macro";
import { useTranslation } from "react-i18next";

import { getBodyStyles, getHeaderStyles } from "./Alert.styles";
import { Color } from "@/types";

import { Icon } from "@/app/components/Icon";

interface AlertProperties extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	variant?: Color;
}

const TypeIcon = ({ variant }: { variant: Color }) => {
	const iconVariant: Record<Color, string> = {
		danger: "CircleCross",
		hint: "CircleQuestionMark",
		info: "CircleInfo",
		success: "CircleCheckMark",
		warning: "CircleExclamationMark",
	};

	return <Icon name={iconVariant[variant]} />;
};

const AlertHeader = styled.div<AlertProperties>(getHeaderStyles);
const AlertBody = styled.div<AlertProperties>(getBodyStyles);

export const Alert = ({ variant = "warning", children, className, ...attributes }: AlertProperties) => {
	const { t } = useTranslation();

	return (
		<div className={cn("flex flex-col overflow-hidden rounded-xl", className)} {...attributes}>
			<AlertHeader variant={variant}>
				<TypeIcon variant={variant} />
				<span>{t(`COMMON.ALERT.${variant.toUpperCase()}`)}</span>
			</AlertHeader>

			<AlertBody variant={variant}>{children}</AlertBody>
		</div>
	);
};
