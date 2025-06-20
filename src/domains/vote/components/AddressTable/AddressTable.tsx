import { Contracts } from "@/app/lib/profiles";
import React, { FC, useCallback, useMemo } from "react";
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
			<tr
				data-testid="EmptyResults"
				className="border-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 border-solid md:border-b-4"
			>
				<td colSpan={columns.length} className="pt-[11px] pb-4">
					<div className="flex flex-col items-center justify-center">
						<h3 className="text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-200 mb-2 text-base font-semibold">
							{t("COMMON.EMPTY_RESULTS.TITLE")}
						</h3>
						<p className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 text-sm">
							{t("COMMON.EMPTY_RESULTS.SUBTITLE")}
						</p>
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
