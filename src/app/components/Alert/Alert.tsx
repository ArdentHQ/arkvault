import cn from "classnames";
import React, { useState } from "react";
import { styled } from "twin.macro";
import { useTranslation } from "react-i18next";

import { AlertColor, getBodyStyles, getChevronProperties, getHeaderStyles } from "./Alert.styles";
import { Icon } from "@/app/components/Icon";

interface AlertProperties extends React.HTMLAttributes<HTMLDivElement> {
	children: React.ReactNode;
	className?: string;
	title?: string;
	variant?: AlertColor;
	collapsible?: boolean;
}

const TypeIcon = ({ variant }: { variant: AlertColor }) => {
	const iconVariant: Record<AlertColor, string> = {
		danger: "CircleCross",
		"danger-dark": "CircleCross",
		hint: "CircleQuestionMark",
		info: "CircleInfo",
		success: "CircleCheckMark",
		warning: "CircleExclamationMark",
	};

	return <Icon name={iconVariant[variant]} />;
};

const AlertHeader = styled.div<AlertProperties>(getHeaderStyles);
const AlertBody = styled.div<AlertProperties>(getBodyStyles);
const AlertChevron = styled.span<
	AlertProperties & {
		collapsed: boolean;
	}
>(getChevronProperties);

export const Alert = ({
	variant = "warning",
	collapsible = false,
	children,
	className,
	title,
	...attributes
}: AlertProperties) => {
	const { t } = useTranslation();

	const [collapsed, setCollapsed] = useState(collapsible);

	return (
		<div className={cn("flex flex-col overflow-hidden rounded-xl", className)} {...attributes}>
			<AlertHeader
				variant={variant}
				onClick={() => collapsible && setCollapsed((current) => !current)}
				collapsible={collapsible}
			>
				<TypeIcon variant={variant} />
				<span>{title || t(`COMMON.ALERT.${variant.toUpperCase()}`)}</span>

				{collapsible && (
					<AlertChevron
						collapsed={collapsible ? false : collapsed}
						variant={variant}
						data-testid="Alert__chevron"
					>
						<Icon name="ChevronDownSmall" size="sm" />
					</AlertChevron>
				)}
			</AlertHeader>

			{!collapsed && <AlertBody variant={variant}>{children}</AlertBody>}
		</div>
	);
};
