import React from "react";
import { styled } from "twin.macro";
import { useTranslation } from "react-i18next";

import { getBodyStyles, getHeaderStyles, getWrapperStyles } from "./Alert.styles";
import { AlertLayout, Color } from "@/types";

import { Icon } from "@/app/components/Icon";

interface AlertProperties extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	title?: string;
	variant?: Color;
	layout?: AlertLayout;
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

const AlertWrapper = styled.div<AlertProperties>(getWrapperStyles);
const AlertHeader = styled.div<AlertProperties>(getHeaderStyles);
const AlertBody = styled.div<AlertProperties>(getBodyStyles);

export const Alert = ({
	variant = "warning",
	layout = "vertical",
	children,
	className,
	title,
	...attributes
}: AlertProperties) => {
	const { t } = useTranslation();

	return (
		<AlertWrapper {...attributes} className={className} variant={variant} layout={layout}>
			<AlertHeader variant={variant} layout={layout}>
				<TypeIcon variant={variant} />
				{layout === "vertical" && <span>{title || t(`COMMON.ALERT.${variant.toUpperCase()}`)}</span>}
			</AlertHeader>

			<AlertBody variant={variant} layout={layout}>
				{children}
			</AlertBody>
		</AlertWrapper>
	);
};
