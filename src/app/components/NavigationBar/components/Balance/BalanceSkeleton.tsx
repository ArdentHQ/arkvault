import React from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/app/components/Skeleton";

interface Properties {
	width?: number;
}

export const BalanceSkeleton = ({ width }: Properties) => {
	const { t } = useTranslation();

	return (
		<div className="bg-theme-secondary-100 -mt-3 flex flex-row items-center justify-center space-x-2 px-8 py-2.5 md:m-0 md:flex-col md:items-start md:justify-start md:space-x-0 md:bg-transparent md:p-0 md:text-right dark:bg-black md:dark:bg-transparent">
			<div className="text-theme-secondary-700 dark:text-theme-secondary-500 md:text-theme-secondary-500 whitespace-nowrap md:text-xs md:font-semibold">
				{t("COMMON.YOUR_BALANCE")}
			</div>
			<div className="py-1">
				<Skeleton height={16} width={width || 60} />
			</div>
		</div>
	);
};
