import cn from "classnames";
import React from "react";
import { useTranslation } from "react-i18next";

import { ToggleAllOptionProperties } from "./FilterNetwork.contracts";
import { Badge } from "@/app/components/Badge";
import { Circle } from "@/app/components/Circle";

export const ToggleAllOption = ({ onClick, isHidden = false, isSelected = false }: ToggleAllOptionProperties) => {
	const { t } = useTranslation();

	if (isHidden) {
		return <></>;
	}

	return (
		<Circle
			size="lg"
			data-testid="network__viewall"
			className="relative mr-5 cursor-pointer border-theme-primary-100 dark:border-theme-secondary-800"
			onClick={onClick}
		>
			<div className="text-sm font-semibold text-theme-primary-700">{t("COMMON.ALL")}</div>

			<Badge
				className={`${
					isSelected
						? "border-theme-primary-700 bg-theme-primary-700 text-white"
						: "border-theme-primary-100 text-theme-primary-700 dark:border-theme-secondary-800"
				}`}
				icon="ChevronDownSmall"
				iconClass={cn("transition-transform", { "rotate-180": isSelected })}
			/>
		</Circle>
	);
};
