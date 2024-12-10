import cn from "classnames";
import React, { useRef } from "react";
import { useTranslation } from "react-i18next";

import type { LabelledTextProperties, LegendProperties, TooltipProperties } from "./PortfolioBreakdown.contracts";
import { useTheme } from "@/app/hooks";
import { Skeleton } from "@/app/components/Skeleton";

const Legend: React.VFC<LegendProperties> = ({ hasZeroBalance, onMoreDetailsClick, dataPoints }) => {
	const { t } = useTranslation();

	return (
		<div className="mb-1 flex w-full justify-between lg:justify-end">
			{dataPoints.length > 0 && (
				<div className="mr-4 flex space-x-4 border-theme-secondary-300 dark:border-theme-secondary-800 lg:border-r lg:pr-4">
					{dataPoints.map(({ color, data }, index) => (
						<div className="flex items-center space-x-1 text-sm font-semibold" key={index}>
							<span className={`h-3 w-1 rounded bg-theme-${color}`} />
							<span className="text-theme-secondary-700 dark:text-theme-secondary-200">{data.label}</span>
							<span className="text-theme-secondary-500 dark:text-theme-secondary-700">
								{data.percentFormatted}
							</span>
						</div>
					))}
				</div>
			)}
			<button
				disabled={hasZeroBalance}
				onClick={onMoreDetailsClick}
				type="button"
				className={cn(
					"mx-auto text-sm font-semibold sm:mx-0",
					hasZeroBalance
						? "cursor-not-allowed text-theme-secondary-500 dark:text-theme-secondary-700"
						: "link",
				)}
			>
				{t("COMMON.MORE_DETAILS")}
			</button>
		</div>
	);
};

const LabelledText: React.FC<LabelledTextProperties> = ({ label, children }) => (
	<div className="flex flex-col space-y-1 pl-4 font-semibold first:pl-0">
		<span className="whitespace-nowrap text-sm text-theme-secondary-500 dark:text-theme-secondary-700">
			{label}
		</span>

		{children("text-lg text-theme-secondary-900 dark:text-theme-secondary-200")}
	</div>
);

const Tooltip: React.VFC<TooltipProperties> = ({ dataPoint: { color, data } }) => {
	const { isDarkMode } = useTheme();

	return (
		<div
			className="tooltip-wrapper"
			data-theme={isDarkMode ? "dark" : "light"}
			data-testid="PortfolioBreakdown__tooltip"
		>
			<div className="flex space-x-3 divide-x divide-theme-secondary-700 text-sm font-semibold">
				<div className="flex items-center space-x-2">
					<div className={`h-3 w-1 rounded bg-theme-${color}`} />
					<span className="text-white">{data.label}</span>
				</div>

				<span className="pl-3 text-theme-secondary-500">{data.amountFormatted}</span>

				<span className="pl-3 text-theme-secondary-500">{data.percentFormatted}</span>
			</div>
		</div>
	);
};

const skeletonBlock = (label: string) => (
	<LabelledText label={label}>
		{() => (
			<div className="flex h-7 items-center justify-end lg:justify-start">
				<Skeleton height={18} width={20} />
			</div>
		)}
	</LabelledText>
);

const PortfolioBreakdownSkeleton: React.VFC = () => {
	const { t } = useTranslation();

	const lineGraphSkeletonReference = useRef<HTMLDivElement | null>(null);

	return (
		<div
			className="-mx-8 flex flex-col bg-theme-secondary-100 px-8 py-4 dark:bg-black sm:mx-0 sm:rounded-xl sm:px-4 lg:flex-row lg:items-end"
			data-testid="PortfolioBreakdownSkeleton"
		>
			<div className="flex">
				<LabelledText label={t("COMMON.YOUR_BALANCE")}>
					{() => (
						<div className="flex h-7 items-center">
							<Skeleton height={18} width={100} />
						</div>
					)}
				</LabelledText>

				<div className="ml-auto flex space-x-4 divide-x divide-theme-secondary-300 border-theme-secondary-300 pl-4 dark:divide-theme-secondary-800 dark:border-theme-secondary-800 lg:ml-4 lg:border-l">
					{skeletonBlock(t("COMMON.ASSETS"))}

					{skeletonBlock(t("COMMON.WALLETS"))}
				</div>
			</div>

			<div
				className="mt-3 w-full max-w-full border-dashed border-theme-secondary-300 dark:border-theme-secondary-800 sm:mt-4 sm:border-t sm:pt-4 lg:ml-12 lg:mt-0 lg:flex-1 lg:border-0 lg:pt-0"
				ref={lineGraphSkeletonReference}
			>
				<Skeleton height={8} />
			</div>
		</div>
	);
};

export { LabelledText, Legend, PortfolioBreakdownSkeleton, Tooltip };
