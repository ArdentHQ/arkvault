import React from "react";
import { useTranslation } from "react-i18next";
import tw, { styled } from "twin.macro";

import { Icon } from "@/app/components/Icon";

const ToggleIcon = styled.span<{ isOpen: boolean; isDisabled?: boolean }>`
	${tw`inline-flex items-center justify-center rounded-full transition duration-200 md:bg-theme-primary-100 md:dark:bg-theme-secondary-800 text-theme-primary-600 dark:text-theme-secondary-200`}
	${({ isOpen }) => (isOpen ? tw`bg-theme-primary-600 text-theme-primary-100 rotate-180` : "")}
	${({ isDisabled }) =>
		isDisabled
			? tw`md:bg-theme-secondary-200 text-theme-secondary-400 md:dark:bg-theme-secondary-800 dark:text-theme-secondary-700`
			: ""}
`;

type Properties = {
	isOpen: boolean;
	label?: React.ReactNode;
	alternativeLabel?: React.ReactNode;
} & React.ButtonHTMLAttributes<any>;

export const CollapseToggleButton = ({ isOpen, className, label, alternativeLabel, ...properties }: Properties) => {
	const { t } = useTranslation();

	return (
		<button
			data-testid="CollapseToggleButton"
			className={`flex items-center space-x-2 font-semibold focus:outline-none ${
				className || "rounded text-theme-secondary-500"
			}`}
			{...properties}
		>
			<span className="flex items-center space-x-1">
				{isOpen ? label || t("COMMON.HIDE") : alternativeLabel || label || t("COMMON.SHOW")}
			</span>
			<ToggleIcon isOpen={isOpen} isDisabled={properties.disabled}>
				<Icon name="ChevronDownSmall" size="sm" className="p-1" />
			</ToggleIcon>
		</button>
	);
};
