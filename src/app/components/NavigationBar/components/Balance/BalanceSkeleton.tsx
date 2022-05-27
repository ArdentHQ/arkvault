import React from "react";
import { useTranslation } from "react-i18next";

import { Skeleton } from "@/app/components/Skeleton";

interface Properties {
	width?: number;
}

export const BalanceSkeleton = ({ width }: Properties) => {
	const { t } = useTranslation();

	return (
		<div className="-mt-3 flex flex-row items-center justify-center space-x-2 bg-theme-secondary-100 py-2.5 px-8 dark:bg-black md:m-0 md:flex-col md:items-start md:justify-start md:space-x-0 md:bg-transparent md:p-0 md:text-right md:dark:bg-transparent">
			<div className="whitespace-nowrap text-theme-secondary-700 dark:text-theme-secondary-500 md:text-xs md:font-semibold md:text-theme-secondary-500">
				{t("COMMON.YOUR_BALANCE")}
			</div>
			<div className="py-1">
				<Skeleton height={16} width={width || 60} />
			</div>
		</div>
	);
};
