import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { AddressTableProperties } from "./AddressTable.contracts";
import { AddressRow } from "@/domains/vote/components/AddressTable/AddressRow/AddressRow";
import { AddressRowMobile } from "@/domains/vote/components/AddressTable/AddressRow/AddressRowMobile";
import { Table } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";

export const AddressTable: FC<AddressTableProperties> = ({ wallets, onSelect, showEmptyResults = false, network }) => {
	const { t } = useTranslation();
	const maxVotes = network?.maximumVotesPerWallet();
	const { isXs, isSm } = useBreakpoint();
	const memoizedWallets = useMemo(() => wallets, [wallets]);

	const columns = useMemo<Column<Contracts.IReadWriteWallet>[]>(() => {
		const commonColumns: Column<Contracts.IReadWriteWallet>[] = [
			{
				Header: t("COMMON.NAME"),
				accessor: (wallet) => wallet.alias() || wallet.address(),
				cellWidth: "w-80",
				headerClassName: "no-border",
				noRoundedBorders: true,
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: (wallet) => wallet.balance?.(),
				cellWidth: "w-60",
				className: "justify-end",
				headerClassName: "hidden xl:table-cell no-border",
			},
			{
				Header: t("COMMON.VALIDATOR"),
				accessor: (wallet) => {
					let votes: Contracts.VoteRegistryItem[];

					try {
						votes = wallet.voting().current();
					} catch {
						votes = [];
					}

					const [first] = votes;

					return first?.wallet?.username();
				},
				cellWidth: "w-60",
				className: maxVotes === 1 ? "ml-15" : "",
				headerClassName: "no-border",
			},
		];

		if (maxVotes === 1) {
			return [
				...commonColumns,
				{
					Header: t("COMMON.RANK"),
					accessor: "rank",
					cellWidth: "w-20",
					// eslint-disable-next-line sonarjs/no-duplicate-string
					className: "justify-center",
					disableSortBy: true,
					headerClassName: "hidden lg:table-cell no-border",
				},
				{
					Header: t("COMMON.STATUS"),
					accessor: "status",
					cellWidth: "w-20",
					className: "justify-center",
					disableSortBy: true,
					headerClassName: "no-border",
				},
				{
					Header: t("COMMON.INFO"),
					accessor: () => "wallet-type",
					cellWidth: "w-30",
					className: "justify-center",
					disableSortBy: true,
					headerClassName: "hidden lg:table-cell no-border",
				},
				{
					accessor: "onSelect",
					disableSortBy: true,
					headerClassName: "no-border",
					noRoundedBorders: true,
				},
			] as Column<Contracts.IReadWriteWallet>[];
		}

		return [
			...commonColumns,
			{
				Header: t("COMMON.VOTES"),
				accessor: "votes",
				cellWidth: "w-20",
				className: "justify-center",
				disableSortBy: true,
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.INFO"),
				accessor: () => "wallet-type",
				cellWidth: "w-30",
				className: "justify-center",
				disableSortBy: true,
				headerClassName: "hidden lg:table-cell no-border",
			},
			{
				accessor: "onSelect",
				disableSortBy: true,
				headerClassName: "no-border",
				noRoundedBorders: true,
			},
		] as Column<Contracts.IReadWriteWallet>[];
	}, [maxVotes, t]);

	const renderTableRow = useCallback(
		(wallet: Contracts.IReadWriteWallet, index: number) => {
			if (isSm || isXs) {
				return <AddressRowMobile index={index} maxVotes={maxVotes} wallet={wallet} onSelect={onSelect} />;
			}

			return <AddressRow index={index} maxVotes={maxVotes} wallet={wallet} onSelect={onSelect} />;
		},
		[maxVotes, onSelect, isSm, isXs],
	);

	const footer = useMemo(() => {
		if (!showEmptyResults) {
			return null;
		}

		return (
			<tr className="border-solid border-theme-secondary-200 dark:border-theme-secondary-800 md:border-b-4">
				<td colSpan={columns.length} className="pb-4 pt-[11px]">
					<div className="flex flex-col items-center justify-center">
						<h3 className="mb-2 text-base font-semibold text-theme-secondary-900">
							{t("COMMON.EMPTY_RESULTS.TITLE")}
						</h3>
						<p className="text-sm text-theme-secondary-700">{t("COMMON.EMPTY_RESULTS.SUBTITLE")}</p>
					</div>
				</td>
			</tr>
		);
	}, [t, showEmptyResults, columns]);

	return (
		<div data-testid="AddressTable">
			<Table
				footer={footer}
				className="with-x-padding"
				columns={columns}
				data={memoizedWallets}
				hideHeader={isSm || isXs}
			>
				{renderTableRow}
			</Table>
		</div>
	);
};
