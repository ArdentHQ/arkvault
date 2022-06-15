import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { AddressTableProperties } from "./AddressTable.contracts";
import { AddressRow } from "@/domains/vote/components/AddressTable/AddressRow/AddressRow";
import { AddressRowMobile } from "@/domains/vote/components/AddressTable/AddressRow/AddressRowMobile";
import { Section } from "@/app/components/Layout";
import { Table } from "@/app/components/Table";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { AccordionContent, AccordionHeader, AccordionWrapper } from "@/app/components/Accordion";
import { useAccordion, useBreakpoint } from "@/app/hooks";
import { Icon } from "@/app/components/Icon";
import { networkDisplayName } from "@/utils/network-utils";

export const AddressTable: FC<AddressTableProperties> = ({ wallets, onSelect, isCompact = false }) => {
	const { t } = useTranslation();
	const { isExpanded, handleHeaderClick } = useAccordion();
	const wallet = useMemo(() => wallets[0], [wallets]);
	const maxVotes = wallet.network().maximumVotesPerWallet();
	const { isXs, isSm } = useBreakpoint();
	const memoizedWallets = useMemo(() => wallets, [wallets]);
	const columns = useMemo<Column<Contracts.IReadWriteWallet>[]>(() => {
		const commonColumns: Column<Contracts.IReadWriteWallet>[] = [
			{
				Header: t("COMMON.MY_ADDRESS"),
				accessor: (wallet) => wallet.alias() || wallet.address(),
				cellWidth: "w-80",
			},
			{
				Header: t("COMMON.WALLET_TYPE"),
				accessor: () => "wallet-type",
				cellWidth: "w-30",
				className: "justify-center",
				disableSortBy: true,
				headerClassName: "hidden md:table-cell",
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: (wallet) => wallet.balance?.(),
				cellWidth: "w-60",
				className: "justify-end",
				headerClassName: "hidden xl:table-cell",
			},
			{
				Header: maxVotes === 1 ? t("COMMON.DELEGATE") : t("COMMON.DELEGATES"),
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
			},
		];

		if (maxVotes === 1) {
			return [
				...commonColumns,
				{
					Header: t("COMMON.RANK"),
					accessor: "rank",
					cellWidth: "w-20",
					className: "justify-center",
					disableSortBy: true,
					headerClassName: "hidden lg:table-cell",
				},
				{
					Header: t("COMMON.STATUS"),
					accessor: "status",
					cellWidth: "w-20",
					className: "justify-center",
					disableSortBy: true,
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
			if (isXs) {
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
		[maxVotes, onSelect, isCompact, isXs],
	);

	return (
		<>
			{isXs || isSm ? (
				<div>
					<AccordionWrapper>
						<AccordionHeader isExpanded={isExpanded} onClick={handleHeaderClick}>
							<div className="flex h-8 w-full flex-grow items-center space-x-3">
								<Icon
									className={
										wallet.network().isLive()
											? "text-theme-primary-600"
											: "text-theme-secondary-700"
									}
									name={wallet.network().ticker()}
									size="lg"
								/>

								<div className="flex space-x-2">
									<h2 className="mb-0 text-lg font-bold">{networkDisplayName(wallet.network())}</h2>
									<span className="text-lg font-bold text-theme-secondary-500 dark:text-theme-secondary-700">
										{wallets.length}
									</span>
								</div>
							</div>
						</AccordionHeader>

						{isExpanded && (
							<AccordionContent data-testid="AddressAccordion">
								<Table
									className="-mt-3 sm:mt-0"
									columns={columns}
									data={memoizedWallets}
									hideHeader={isXs}
								>
									{renderTableRow}
								</Table>
							</AccordionContent>
						)}
					</AccordionWrapper>
				</div>
			) : (
				<Section>
					<div data-testid="AddressTable">
						<div className="flex items-center space-x-4 py-5">
							<NetworkIcon size="lg" network={wallet.network()} />
							<div className="flex space-x-2">
								<h2 className="mb-0 text-lg font-bold">{networkDisplayName(wallet.network())}</h2>
								<span className="text-lg font-bold text-theme-secondary-500 dark:text-theme-secondary-700">
									{wallets.length}
								</span>
							</div>
						</div>

						<Table columns={columns} data={memoizedWallets}>
							{renderTableRow}
						</Table>
					</div>
				</Section>
			)}
		</>
	);
};
