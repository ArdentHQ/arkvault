import cn from "classnames";
import React, { useCallback, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { LabelledText, Legend, PortfolioBreakdownSkeleton, Tooltip } from "./PortfolioBreakdown.blocks";
import { PortfolioBreakdownProperties } from "./PortfolioBreakdown.contracts";
import { formatAmount, formatPercentage, getColor, getOtherGroupColor } from "./PortfolioBreakdown.helpers";
import { assertNumber } from "@/utils/assertions";
import { Amount } from "@/app/components/Amount";
import { EmptyBlock } from "@/app/components/EmptyBlock";
import {
	AddToOtherGroupFunction,
	GRAPH_COLOR_EMPTY,
	GRAPH_COLOR_EMPTY_DARK,
	GraphDataPoint,
} from "@/app/components/Graphs/Graphs.contracts";
import { LineGraph } from "@/app/components/Graphs/LineGraph";
import { useTheme } from "@/app/hooks";
import { PortfolioBreakdownDetails } from "@/domains/dashboard/components/PortfolioBreakdownDetails";
import { usePortfolioBreakdown } from "@/domains/dashboard/hooks/use-portfolio-breakdown";

export const PortfolioBreakdown: React.VFC<PortfolioBreakdownProperties> = ({
	profile,
	profileIsSyncingExchangeRates,
	selectedNetworkIds,
	liveNetworkIds,
}) => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const showDetailsModal = useCallback(() => setIsDetailsOpen(true), []);
	const hideDetailsModal = useCallback(() => setIsDetailsOpen(false), []);

	const isFilteringNetworks = useMemo(
		() => !liveNetworkIds.every((id) => selectedNetworkIds.includes(id)),
		[liveNetworkIds, selectedNetworkIds],
	);

	const { loading, balance, assets, walletsCount, ticker } = usePortfolioBreakdown({
		profile,
		profileIsSyncingExchangeRates,
		selectedNetworkIds,
	});

	const hasZeroBalance = balance === 0;

	const lineGraphData = useMemo<GraphDataPoint[]>(() => {
		if (hasZeroBalance) {
			return assets.map((asset) => ({
				color: isDarkMode ? GRAPH_COLOR_EMPTY_DARK : GRAPH_COLOR_EMPTY,
				data: {
					amount: 0,
					amountFormatted: formatAmount(0, ticker),
					label: asset.label,
					percentFormatted: `0%`,
				},
				value: 0,
			}));
		}

		return assets.map((asset, index) => ({
			color: getColor(index, isDarkMode),
			data: {
				amount: asset.convertedAmount,
				amountFormatted: formatAmount(asset.convertedAmount, ticker),
				label: asset.label,
				percentFormatted: formatPercentage(asset.percent),
			},
			value: asset.percent,
		}));
	}, [assets, hasZeroBalance, isDarkMode, ticker]);

	const addToOtherGroup = useCallback<AddToOtherGroupFunction>(
		(otherGroup, entry) => {
			const amount = (otherGroup?.data.amount ?? 0) + entry.data.amount;
			assertNumber(amount);

			const value = (otherGroup?.value ?? 0) + entry.value;

			return {
				color: getOtherGroupColor(isDarkMode),
				data: {
					amount,
					amountFormatted: formatAmount(amount, ticker),
					label: t("COMMON.OTHER"),
					percentFormatted: formatPercentage(value),
				},
				value,
			};
		},
		[isDarkMode, t, ticker],
	);

	if (loading) {
		return <PortfolioBreakdownSkeleton />;
	}

	if (assets.length === 0 && !isFilteringNetworks) {
		return <></>;
	}

	if (assets.length === 0 && isFilteringNetworks) {
		return (
			<EmptyBlock>
				<Trans i18nKey="DASHBOARD.PORTFOLIO_BREAKDOWN.FILTERED" />
			</EmptyBlock>
		);
	}

	return (
		<>
			<div
				className="-mx-6 flex flex-col bg-theme-secondary-100 px-6 py-4 dark:bg-black sm:mx-0 sm:rounded-xl lg:flex-row"
				data-testid="PortfolioBreakdown"
			>
				<div className="flex">
					<LabelledText label={t("COMMON.YOUR_BALANCE")}>
						{(textClassName) => <Amount className={textClassName} ticker={ticker} value={balance} />}
					</LabelledText>

					<div className="ml-auto flex space-x-4 divide-x divide-theme-secondary-300 border-theme-secondary-300 pl-4 text-right dark:divide-theme-secondary-800 dark:border-theme-secondary-800 lg:ml-4 lg:border-l lg:text-left">
						<LabelledText label={t("COMMON.ASSETS")}>
							{() => (
								<span
									data-testid="PortfolioBreakdown__assets"
									className="text-lg text-theme-secondary-700 dark:text-theme-secondary-200 lg:text-theme-secondary-900"
								>
									{assets.length}
								</span>
							)}
						</LabelledText>

						<LabelledText label={t("COMMON.WALLETS")}>
							{() => (
								<span
									data-testid="PortfolioBreakdown__wallets"
									className="text-lg text-theme-secondary-700 dark:text-theme-secondary-200 lg:text-theme-secondary-900"
								>
									{walletsCount}
								</span>
							)}
						</LabelledText>
					</div>
				</div>

				<div
					className={cn(
						"mt-3 w-full border-dashed border-theme-secondary-300 dark:border-theme-secondary-800 sm:mt-4 sm:border-t sm:pt-4 lg:ml-12 lg:mt-0 lg:flex-1 lg:border-0 lg:pt-0",
						{
							"hidden lg:block": hasZeroBalance,
						},
					)}
				>
					<LineGraph
						data={lineGraphData}
						addToOtherGroup={addToOtherGroup}
						renderAsEmpty={hasZeroBalance}
						renderTooltip={(dataPoint) => <Tooltip dataPoint={dataPoint} />}
						renderLegend={(dataPoints) => (
							<Legend
								dataPoints={dataPoints}
								hasZeroBalance={hasZeroBalance}
								onMoreDetailsClick={showDetailsModal}
							/>
						)}
					/>
				</div>
			</div>

			<PortfolioBreakdownDetails
				isOpen={isDetailsOpen}
				assets={assets}
				balance={balance}
				exchangeCurrency={ticker}
				onClose={hideDetailsModal}
			/>
		</>
	);
};
