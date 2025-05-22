import React from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/app/components/Skeleton";

interface Properties {
	width?: number;
}

export const BalanceSkeleton = ({ width }: Properties) => {
	const { t } = useTranslation();

	return (
		<div className="flex flex-row justify-center items-center py-2.5 px-8 -mt-3 space-x-2 md:flex-col md:justify-start md:items-start md:p-0 md:m-0 md:space-x-0 md:text-right md:bg-transparent dark:bg-black bg-theme-secondary-100 md:dark:bg-transparent">
			<div className="whitespace-nowrap md:text-xs md:font-semibold text-theme-secondary-700 md:text-theme-secondary-500 dark:text-theme-secondary-500">
				{t("COMMON.YOUR_BALANCE")}
			</div>
			<div className="py-1">
				<Skeleton height={16} width={width || 60} />
			</div>
		</div>
	);
};
