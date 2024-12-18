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
import cn from "classnames";
import { Select } from "@/app/components/SelectDropdown";

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
						className={cn("transition-all duration-300 ease-in-out", {
							"fill-theme-warning-400 stroke-theme-warning-400 text-theme-warning-400": active,
							"fill-transparent stroke-theme-warning-400 hover:fill-theme-warning-200": !active,
						})}
						name={"StarFilled"}
						dimensions={[18, 18]}
					/>
				</button>
			</Tooltip>
		</div>
	);
};

export const WalletsList: React.VFC<WalletsListProperties> = ({
	wallets,
	itemsPerPage: initialPerPage,
	showPagination = true,
	className,
}) => {
	const { isMdAndAbove } = useBreakpoint();
	const { t } = useTranslation();
	const { profileIsSyncing } = useConfiguration();

	const showSkeletons = profileIsSyncing && wallets.length === 0;

	const [currentPage, setCurrentPage] = useState(1);
	const [starredFirst, setStarredFirst] = useState(true);

	const [perPage, setPerPage] = useState(initialPerPage);

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
				headerClassName: "no-border first:pl-4 md:first:pl-6",
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
		<AccordionContent data-testid="WalletsList" className={twMerge("px-6 pb-4 md:p-0", className)}>
			{(wallets.length > 0 || showSkeletons) && (
				<>
					<div data-testid="WalletTable">
						{isMdAndAbove && (
							<Table
								columns={columns}
								data={tableRows}
								rowsPerPage={perPage}
								currentPage={currentPage}
								initialState={initialState}
								className={cn("with-x-padding", {
									"after:mx-[0.15rem] after:block after:h-[5px] after:rounded-b-lg after:bg-theme-primary-100 after:content-[''] after:dark:bg-theme-secondary-800":
										wallets.length <= initialPerPage,
								})}
							>
								{renderTableRow}
							</Table>
						)}

						{!isMdAndAbove && (
							<div className="space-y-3">
								{wallets.slice((currentPage - 1) * perPage, perPage * currentPage).map((wallet) => (
									<WalletListItem key={wallet.id()} wallet={wallet} isLargeScreen={false} />
								))}
							</div>
						)}
					</div>

					{showPagination && (
						<div className="flex w-full flex-col gap-4 border-theme-secondary-300 pt-4 dark:border-theme-secondary-800 sm:flex-row sm:justify-between md:border-t md:px-6 md:pb-4">
							<div className="flex items-center justify-center gap-2 text-sm font-semibold leading-5 text-theme-secondary-700 dark:text-theme-secondary-200 sm:justify-start">
								<span>{t("COMMON.SHOW")}</span>
								<Select
									options={[10, 25, 50, 100].map((v) => ({
										label: v.toString(),
										value: v.toString(),
									}))}
									allowOverflow={true}
									allowFreeInput={false}
									readOnly={true}
									defaultValue={perPage.toString()}
									wrapperClassName="relative"
									className="!h-8 !w-[78px] !px-3"
									onChange={(selected) => {
										setCurrentPage(1);
										setPerPage(Number(selected.value));
									}}
								/>
								<span>{t("COMMON.RECORDS")}</span>
							</div>

							<Pagination
								totalCount={wallets.length}
								itemsPerPage={perPage}
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
