import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { AddressTableProperties } from "./AddressTable.contracts";
import { AddressRow } from "@/domains/vote/components/AddressTable/AddressRow/AddressRow";
import { AddressRowMobile } from "@/domains/vote/components/AddressTable/AddressRow/AddressRowMobile";
import { Section } from "@/app/components/Layout";
import { Table } from "@/app/components/Table";
import { useBreakpoint } from "@/app/hooks";
import { assertNetwork } from "@/utils/assertions";
import { networkDisplayName } from "@/utils/network-utils";
import { Icon } from "@/app/components/Icon";

export const AddressTable: FC<AddressTableProperties> = ({ wallets, onSelect, isCompact = false, profile }) => {
	const { t } = useTranslation();
	const wallet = useMemo(() => wallets[0], [wallets]);
	const maxVotes = wallet.network().maximumVotesPerWallet();
	const { isXs, isSm } = useBreakpoint();
	const memoizedWallets = useMemo(() => wallets, [wallets]);

	const network = profile.availableNetworks().find((network) => network.id() === wallet.network().id());
	assertNetwork(network);

	const columns = useMemo<Column<Contracts.IReadWriteWallet>[]>(() => {
		const commonColumns: Column<Contracts.IReadWriteWallet>[] = [
			{
				Header: t("COMMON.NAME"),
				accessor: (wallet) => wallet.alias() || wallet.address(),
				cellWidth: "w-80",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: (wallet) => wallet.balance?.(),
				cellWidth: "w-60",
				className: "justify-end",
				headerClassName: "hidden xl:table-cell no-border",
			},
			{
				Header: t("COMMON.DELEGATE"),
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
			},
		] as Column<Contracts.IReadWriteWallet>[];
	}, [maxVotes, t]);

	const renderTableRow = useCallback(
		(wallet: Contracts.IReadWriteWallet, index: number) => {
			if (isSm || isXs) {
				return <AddressRowMobile index={index} maxVotes={maxVotes} wallet={wallet} onSelect={onSelect} />;
			}

			return (
				<AddressRow
					index={index}
					maxVotes={maxVotes}
					wallet={wallet}
					onSelect={onSelect}
					isCompact={isCompact}
				/>
			);
		},
		[maxVotes, onSelect, isCompact, isSm, isXs],
	);

	return (
		<Section className="py-0 pt-0 first:pt-1 sm:first:pt-0">
			<div data-testid="AddressTable">
				<div className="hidden items-center space-x-3 pb-3 pt-6 sm:flex">
					<Icon
						className="rounded-xl bg-theme-secondary-100 p-2.5 dark:bg-transparent dark:border-2 dark:border-theme-secondary-800 text-theme-navy-600"
						data-testid="NetworkIcon__icon"
						name={network.ticker()}
						fallback={
							<span className={isCompact ? "inline-flex w-5 justify-center text-sm" : undefined}>
								{networkDisplayName(network).slice(0, 2).toUpperCase()}
							</span>
						}
						dimensions={[24, 24]}
					/>
					<h2 className="mb-0 text-lg font-semibold leading-[21px]">{networkDisplayName(network)}</h2>
				</div>

				<Table
					className="with-x-padding overflow-hidden rounded-xl border-theme-secondary-300 dark:border-theme-secondary-800 md:border"
					columns={columns}
					data={memoizedWallets}
					hideHeader={isSm || isXs}
				>
					{renderTableRow}
				</Table>
			</div>
		</Section>
	);
};
