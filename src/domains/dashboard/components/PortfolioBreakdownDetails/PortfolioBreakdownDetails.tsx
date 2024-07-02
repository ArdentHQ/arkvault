import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { SmAndAbove, Xs } from "@/app/components/Breakpoint";
import { DonutGraph } from "@/app/components/Graphs/DonutGraph";
import { AddToOtherGroupFunction, GraphDataPoint } from "@/app/components/Graphs/Graphs.contracts";
import { useGraphData } from "@/app/components/Graphs/Graphs.shared";
import { Modal } from "@/app/components/Modal";
import { useTheme } from "@/app/hooks";
import {
	formatPercentage,
	getColor,
	getOtherGroupColor,
} from "@/domains/dashboard/components/PortfolioBreakdown/PortfolioBreakdown.helpers";

import { AssetList, AssetListMobile, Balance, Tooltip } from "./PortfolioBreakdownDetails.blocks";
import { GRAPH_HEIGHT, PortfolioBreakdownDetailsProperties } from "./PortfolioBreakdownDetails.contracts";

export const PortfolioBreakdownDetails: React.VFC<PortfolioBreakdownDetailsProperties> = ({
	isOpen,
	assets,
	balance,
	exchangeCurrency,
	onClose,
}) => {
	const { t } = useTranslation();
	const { isDarkMode } = useTheme();

	const addToOtherGroup = useCallback<AddToOtherGroupFunction>(
		(otherGroup, entry) => {
			const value = (otherGroup?.value ?? 0) + entry.value;

			return {
				color: getOtherGroupColor(isDarkMode),
				data: {
					label: t("COMMON.OTHER"),
					percentFormatted: formatPercentage(value),
				},
				value,
			};
		},
		[isDarkMode, t],
	);

	const { group } = useGraphData("donut", addToOtherGroup);

	const donutGraphData = useMemo<GraphDataPoint[]>(
		() =>
			group(
				assets.map((asset, index) => ({
					color: getColor(index, isDarkMode),
					data: {
						label: asset.label,
						percentFormatted: formatPercentage(asset.percent),
					},
					value: asset.percent,
				})),
				GRAPH_HEIGHT,
			),
		[assets, group, isDarkMode],
	);

	const ungroupedAssetLabels = useMemo<string[]>(
		() => donutGraphData.map(({ data }) => `${data.label}`).filter((label) => label !== t("COMMON.OTHER")),
		[donutGraphData, t],
	);

	return (
		<Modal isOpen={isOpen} title={t("DASHBOARD.PORTFOLIO_BREAKDOWN_DETAILS.TITLE")} onClose={onClose} noButtons>
			<div className="space-y-4">
				<div className="flex justify-center">
					<DonutGraph
						data={donutGraphData}
						size={GRAPH_HEIGHT}
						renderTooltip={(dataPoint) => <Tooltip dataPoint={dataPoint} />}
						renderContentInsideCircle={() => <Balance value={balance} ticker={exchangeCurrency} />}
					/>
				</div>

				<Xs>
					<AssetListMobile
						assets={assets}
						exchangeCurrency={exchangeCurrency}
						ungroupedAssetLabels={ungroupedAssetLabels}
					/>
				</Xs>

				<SmAndAbove>
					<AssetList
						assets={assets}
						exchangeCurrency={exchangeCurrency}
						ungroupedAssetLabels={ungroupedAssetLabels}
					/>
				</SmAndAbove>
			</div>
		</Modal>
	);
};
