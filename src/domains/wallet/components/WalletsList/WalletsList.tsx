import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column, TableState } from "react-table";
import { Table } from "@/app/components/Table";
import { WalletListItem, WalletListItemProperties } from "@/app/components/WalletListItem";
import { WalletListItemSkeleton } from "@/app/components/WalletListItem/WalletListItemSkeleton";
import { useConfiguration } from "@/app/contexts";
import { useBreakpoint } from "@/app/hooks";
import { WalletsListProperties } from "@/domains/wallet/components/WalletsList/WalletsList.contracts";
import { Pagination } from "@/app/components/Pagination";
import { Tooltip } from "@/app/components/Tooltip";
import { Icon } from "@/app/components/Icon";
import { AccordionContent } from "@/app/components/Accordion";
import { twMerge } from "tailwind-merge";

const StarredHeader = ({ active, onClick }: { active: boolean; onClick: () => void }) => {
	const { t } = useTranslation();

	return (
		<div className="py-0.5 pr-3">
			<Tooltip content={t("WALLETS.PAGE_WALLET_DETAILS.STARRED_FIRST")}>
				<button
					type="button"
					data-testid="WalletIcon__Starred__header"
					className="flex shrink-0 cursor-pointer items-center justify-center rounded ring-theme-primary-400 ring-offset-theme-background focus:outline-none focus:ring-2 focus:ring-offset-8"
					onClick={onClick}
				>
					<Icon
						className="text-theme-warning-400"
						name={active ? "StarFilled" : "Star"}
						dimensions={[18, 18]}
					/>
				</button>
			</Tooltip>
		</div>
	);
};

export const WalletsList: React.VFC<WalletsListProperties> = ({
	wallets,
	itemsPerPage,
	showPagination = true,
	className,
}) => {
	const { isMdAndAbove } = useBreakpoint();
	const { t } = useTranslation();
	const { profileIsSyncing } = useConfiguration();

	const showSkeletons = profileIsSyncing && wallets.length === 0;

	const [currentPage, setCurrentPage] = useState(1);
	const [starredFirst, setStarredFirst] = useState(true);

	const initialState = useMemo<Partial<TableState<WalletListItemProperties>>>(
		() => ({
			sortBy: [
				{
					id: "alias",
				},
			],
		}),
		[],
	);

	const compareWithStar = useCallback(
		(rowA, rowB, columnId, desc) => {
			if (showSkeletons) {
				return 0;
			}

			if (starredFirst) {
				return (
					(rowB.values.starred - rowA.values.starred) * (desc ? -1 : 1) ||
					rowA.values[columnId].toString().localeCompare(rowB.values[columnId], undefined, { numeric: true })
				);
			}

			return rowA.values[columnId].toString().localeCompare(rowB.values[columnId], undefined, { numeric: true });
		},
		[starredFirst, showSkeletons],
	);

	const columns: Column<Contracts.IReadWriteWallet>[] = useMemo(
		() => [
			{
				Header: () => (
					<StarredHeader active={starredFirst} onClick={() => setStarredFirst((value) => !value)} />
				),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.isStarred?.(),
				cellWidth: "w-1",
				disableSortBy: true,
				headerClassName: "no-border",
				hideSortArrow: true,
				id: "starred",
				noRoundedBorders: true,
			},
			{
				Header: t("COMMON.NAME"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.alias?.(),
				className: "-ml-3",
				headerClassName: "no-border hidden lg:table-cell",
				id: "name",
				sortType: compareWithStar,
			},
			{
				Header: t("COMMON.ADDRESS"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.alias?.() || wallet.address?.(),
				className: "-ml-3",
				headerClassName: "no-border",
				id: "alias",
				sortType: compareWithStar,
			},
			{
				Header: t("COMMON.INFO"),
				cellWidth: "w-36",
				className: "justify-center",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.BALANCE"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.balance?.(),
				cellWidth: "w-40",
				className: "flex-row-reverse justify-end",
				headerClassName: "no-border",
				sortType: compareWithStar,
			},
			{
				Header: t("COMMON.CURRENCY"),
				// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.convertedBalance?.(),
				cellWidth: "w-32",
				className: "justify-end",
				headerClassName: "hidden lg:table-cell no-border",
				sortType: compareWithStar,
			},
			{
				Header: "Actions",
				className: "hidden",
				headerClassName: "no-border",
				minimumWidth: true,
				noRoundedBorders: true,
			},
		],
		[t, starredFirst],
	);

	const tableRows = useMemo<Contracts.IReadWriteWallet[]>(() => {
		const skeletonRows = Array.from<Contracts.IReadWriteWallet>({ length: 3 }).fill(
			{} as Contracts.IReadWriteWallet,
		);
		return showSkeletons ? skeletonRows : wallets;
	}, [showSkeletons, wallets]);

	const renderTableRow = useCallback(
		(wallet: Contracts.IReadWriteWallet) =>
			showSkeletons ? <WalletListItemSkeleton /> : <WalletListItem wallet={wallet} />,
		[showSkeletons],
	);

	return (
		<AccordionContent data-testid="WalletsList" className={twMerge(className, "md:p-0")}>
			{(wallets.length > 0 || showSkeletons) && (
				<>
					<div data-testid="WalletTable">
						{isMdAndAbove && (
							<Table
								columns={columns}
								data={tableRows}
								rowsPerPage={itemsPerPage}
								currentPage={currentPage}
								initialState={initialState}
								className="with-x-padding"
							>
								{renderTableRow}
							</Table>
						)}

						{!isMdAndAbove && (
							<div className="space-y-3">
								{wallets.slice(0, itemsPerPage).map((wallet) => (
									<WalletListItem key={wallet.id()} wallet={wallet} isLargeScreen={false} />
								))}
							</div>
						)}
					</div>

					{showPagination && (
						<div className="my-8 flex w-full justify-center">
							<Pagination
								totalCount={wallets.length}
								itemsPerPage={itemsPerPage}
								onSelectPage={setCurrentPage}
								currentPage={currentPage}
							/>
						</div>
					)}
				</>
			)}
		</AccordionContent>
	);
};
