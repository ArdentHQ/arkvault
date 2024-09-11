import { Helpers } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column, TableState } from "react-table";
import {
	AssetListItemProperties,
	AssetListProperties,
	BalanceProperties,
	ONE_MILLION,
	TooltipProperties,
} from "./PortfolioBreakdownDetails.contracts";
import { Amount } from "@/app/components/Amount";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { Tooltip as AppTooltip } from "@/app/components/Tooltip";
import { useTheme } from "@/app/hooks";
import { AssetItem } from "@/domains/dashboard/components/PortfolioBreakdown/PortfolioBreakdown.contracts";
import {
	formatAmount,
	formatPercentage,
	getColor,
	getOtherGroupColor,
} from "@/domains/dashboard/components/PortfolioBreakdown/PortfolioBreakdown.helpers";

const AssetListItem: React.VFC<AssetListItemProperties> = ({ asset, index, exchangeCurrency, grouped }) => {
	const { isDarkMode } = useTheme();
	const color = grouped ? getOtherGroupColor(isDarkMode) : getColor(index, isDarkMode);

	return (
		<TableRow>
			<TableCell variant="start" innerClassName="space-x-3">
				<div className={`h-5 w-1 rounded bg-theme-${color}`} />
				<span className="font-semibold">{asset.label}</span>
			</TableCell>

			<TableCell innerClassName="justify-end">
				<Amount value={asset.amount} ticker={asset.label} className="font-semibold" />
			</TableCell>

			<TableCell innerClassName="justify-end">
				<Amount
					value={asset.convertedAmount}
					ticker={exchangeCurrency}
					className="font-semibold text-theme-secondary-text"
				/>
			</TableCell>

			<TableCell variant="end" innerClassName="justify-end">
				<span className="font-semibold text-theme-secondary-text">{formatPercentage(asset.percent)}</span>
			</TableCell>
		</TableRow>
	);
};

const AssetListItemMobile: React.VFC<AssetListItemProperties> = ({ asset, index, exchangeCurrency, grouped }) => {
	const { isDarkMode } = useTheme();
	const color = grouped ? getOtherGroupColor(isDarkMode) : getColor(index, isDarkMode);

	return (
		<div className="mt-4 flex items-center border-b border-theme-secondary-300 pb-4 text-sm last:border-b-0 last:pb-0 dark:border-theme-secondary-800">
			<div className={`flex h-10 w-1 self-stretch bg-theme-${color} rounded-sm`} />

			<div className="border-theme-${color} ml-3 flex flex-col justify-center">
				<div className="justify-between space-x-1 font-semibold">
					<span>{asset.label}</span>
					<span className="text-theme-secondary-500 dark:text-theme-secondary-700">
						{formatPercentage(asset.percent)}
					</span>
				</div>

				<span className="font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					{asset.displayName}
				</span>
			</div>

			<div className="ml-auto flex flex-col items-end justify-between">
				<span className="whitespace-nowrap font-semibold">
					<Amount value={asset.amount} ticker="USD" showTicker={false} /> {asset.label}
				</span>
				<span className="whitespace-nowrap font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					<Amount value={asset.convertedAmount} ticker="USD" showTicker={false} /> {exchangeCurrency}
				</span>
			</div>
		</div>
	);
};

const AssetList: React.VFC<AssetListProperties> = ({ assets, exchangeCurrency, ungroupedAssetLabels }) => {
	const { t } = useTranslation();

	const initialState = useMemo<Partial<TableState<AssetItem>>>(
		() => ({
			sortBy: [
				{
					desc: true,
					id: "percent",
				},
			],
		}),
		[],
	);

	const columns = useMemo<Column<AssetItem>[]>(
		() => [
			{
				Header: t("COMMON.ASSET"),
				accessor: "label",
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: "amount",
				className: "justify-end",
			},
			{
				Header: t("COMMON.CURRENCY"),
				accessor: "convertedAmount",
				className: "justify-end",
			},
			{
				Header: "%",
				accessor: "percent",
				className: "justify-end",
			},
		],
		[t],
	);

	const renderTableRow = useCallback(
		(asset: AssetItem, index: number) => (
			<AssetListItem
				asset={asset}
				index={index}
				exchangeCurrency={exchangeCurrency}
				grouped={!ungroupedAssetLabels.includes(asset.label)}
			/>
		),
		[exchangeCurrency, ungroupedAssetLabels],
	);

	return (
		<Table columns={columns} data={assets} initialState={initialState}>
			{renderTableRow}
		</Table>
	);
};

const AssetListMobile: React.VFC<AssetListProperties> = ({ assets, exchangeCurrency, ungroupedAssetLabels }) => {
	const renderListItem = useCallback(
		(asset: AssetItem, index: number) => (
			<AssetListItemMobile
				key={asset.label}
				asset={asset}
				index={index}
				exchangeCurrency={exchangeCurrency}
				grouped={!ungroupedAssetLabels.includes(asset.label)}
			/>
		),
		[exchangeCurrency, ungroupedAssetLabels],
	);

	return <>{assets.map(renderListItem)}</>;
};

const Tooltip: React.VFC<TooltipProperties> = ({ dataPoint: { color, data } }) => (
	<div
		data-testid="PortfolioBreakdownDetails__tooltip"
		className="flex items-center space-x-3 divide-x divide-theme-secondary-700 rounded bg-theme-secondary-900 px-3 py-2 text-sm font-semibold dark:bg-theme-secondary-800"
	>
		<div className="flex items-center space-x-2">
			<div className={`h-3 w-1 rounded bg-theme-${color}`} />
			<span className="text-white">{data.label}</span>
		</div>

		<span className="pl-3 text-theme-secondary-500">{data.percentFormatted}</span>
	</div>
);

const Balance: React.VFC<BalanceProperties> = ({ ticker, value }) => {
	const { t } = useTranslation();

	const isMoreThanOneMillion = value >= ONE_MILLION;

	const renderAmount = useCallback(() => {
		const formatted = Helpers.Currency.format(
			isMoreThanOneMillion ? +(value / ONE_MILLION).toFixed(2) : value,
			ticker,
			{
				withTicker: false,
			},
		);

		if (isMoreThanOneMillion) {
			return (
				<AppTooltip content={formatAmount(value, ticker)}>
					<div data-testid="Amount" className="whitespace-nowrap">
						{formatted}m
					</div>
				</AppTooltip>
			);
		}

		const parts = formatted.split(".");
		const shouldLowerFontSizeForDecimals = parts[1]?.length > 2;

		if (shouldLowerFontSizeForDecimals) {
			return (
				<span data-testid="Amount" className="whitespace-nowrap text-2xl">
					{parts[0]}.
					<span data-testid="Amount__decimals" className="text-base">
						{parts[1]}
					</span>
				</span>
			);
		}

		return <Amount className="text-2xl" ticker={ticker} value={value} showTicker={false} />;
	}, [isMoreThanOneMillion, ticker, value]);

	return (
		<div
			data-testid="PortfolioBreakdownDetails__balance"
			className={cn("flex flex-col items-center justify-center space-y-2", {
				"pointer-events-none": !isMoreThanOneMillion,
			})}
		>
			<span className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
				{t("COMMON.YOUR_BALANCE")}
			</span>
			<h3 className="font-bold text-theme-secondary-900 dark:text-theme-secondary-200">{renderAmount()}</h3>
			<span className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
				{ticker}
			</span>
		</div>
	);
};

export { AssetList, AssetListMobile, Balance, Tooltip };
