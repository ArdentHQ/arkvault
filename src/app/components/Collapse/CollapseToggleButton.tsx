import React from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { twMerge } from "tailwind-merge";
import cn from "classnames";

const ToggleIcon = ({
	isOpen,
	isDisabled,
	...props
}: { isOpen: boolean; isDisabled?: boolean } & React.HTMLAttributes<HTMLSpanElement>) => (
	<span
		{...props}
		className={twMerge(
			"inline-flex items-center justify-center rounded-full text-theme-primary-600 transition duration-200 dark:text-theme-secondary-200 md:bg-theme-primary-100 md:dark:bg-theme-secondary-800",
			cn({
				"rotate-180 text-theme-primary-100 md:bg-theme-primary-600": isOpen,
				"text-theme-secondary-400 dark:text-theme-secondary-700 md:bg-theme-secondary-200 md:dark:bg-theme-secondary-800":
					isDisabled,
			}),
			props.className,
		)}
	/>
);

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
			type="button"
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
