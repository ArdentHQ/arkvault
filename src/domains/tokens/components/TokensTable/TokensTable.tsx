import React, { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { Table } from "@/app/components/Table";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokensTableFooter, TokensTableHeader } from "./TokensTable.blocks";
import { useProfileTokens } from "@/domains/tokens/pages/hooks/use-profile-tokens";
import { TokenRow } from "@/domains/tokens/components/TokenRow/TokenRow";
import { useWalletActions } from "@/domains/wallet/hooks";

export const TokensTable = ({
	onClick,
	skeletonRowsLimit = 8,
}: {
	onClick?: (wallet: WalletToken) => void;
	skeletonRowsLimit?: number;
}) => {
	const { isMdAndAbove, isXs, isSmAndAbove } = useBreakpoint();
	const activeProfile = useActiveProfile();
	const [query, setQuery] = useState("");

	const wallets = activeProfile.wallets().selected();

	const { tokens, isLoadingTokens, isLoadingMore, hasMore, hasEmptyResults, fetchMore } = useProfileTokens({
		profile: activeProfile,
		wallets,
	});

	const { handleTokenSend } = useWalletActions({ wallets });

	const { t } = useTranslation();

	const showSkeleton = isLoadingTokens && tokens.length === 0;

	const skeletonRows: WalletToken[] = Array.from({ length: skeletonRowsLimit }, () => ({}) as WalletToken);
	const data = showSkeleton ? skeletonRows : tokens;

	const listColumns = useMemo<Column<WalletToken>[]>(
		() => [
			{
				Header: t("COMMON.NAME"),
				cellWidth: "w-32 xl:w-40",
				headerClassName: "no-border",
				noRoundedBorders: true,
			},
			{
				Header: t("COMMON.SYMBOL"),
				cellWidth: "w-28",
				headerClassName: "no-border hidden md-lg:table-cell",
			},
			{
				Header: t("COMMON.CONTRACT"),
				cellWidth: "w-48 xl:w-40",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.TOKEN_BALANCE"),
				cellWidth: "w-40",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border whitespace-nowrap",
			},

			{
				Header: t("COMMON.VALUE"),
				cellWidth: "w-40",
				className: "justify-center",
				headerClassName: "no-border hidden lg:table-cell",
			},
			{
				Header: " ",
				accessor: "symbol",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border",
				minimumWidth: true,
				noRoundedBorders: true,
			},
		],
		[t],
	);

	const renderTableRow = useCallback(
		(row: WalletToken) => (
			<TokenRow
				data-testid="TokensTableRow"
				isLoading={showSkeleton}
				onClick={() => {
					onClick?.(row);
				}}
				onSend={() => handleTokenSend({ tokenContractAddress: row.token().address() })}
				walletToken={row}
				profile={activeProfile}
			/>
		),
		[showSkeleton, onClick, handleTokenSend, activeProfile],
	);

	const shouldRenderTable = wallets.length === 1 && ((isXs && (tokens.length > 0 || showSkeleton)) || isSmAndAbove);

	return (
		<>
			{isXs && tokens.length === 0 && !showSkeleton && (
				<p
					data-testid="NoResultsMessage"
					className="text-theme-secondary-700 dark:text-theme-secondary-600 dim:text-theme-dim-500 p-4 px-6 text-center text-sm"
				>
					{t("TOKENS.EMPTY_TOKENS")}
				</p>
			)}

			{shouldRenderTable && (
				<SearchableTableWrapper
					innerClassName="lg:pb-28 md:pb-18 sm:pb-16 pb-18"
					searchQuery={query}
					setSearchQuery={setQuery}
					searchPlaceholder={t("TOKENS.ENTER_TOKEN_NAME")}
					extra={
						<div className="mr-6 hidden items-center space-x-1 md:flex">
							<TokensTableHeader activeProfile={activeProfile} />
						</div>
					}
				>
					<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 mb-4 flex items-center justify-between border-b border-dashed py-3 md:hidden">
						<TokensTableHeader activeProfile={activeProfile} />
					</div>

					<div data-testid="TokenList">
						<Table
							columns={listColumns}
							data={data}
							className="with-x-padding"
							footer={
								<TokensTableFooter
									tokensCount={Number(!hasEmptyResults)}
									isLoadingMore={isLoadingMore}
									isLoading={isLoadingTokens}
									hasMore={!!hasMore}
									columnsCount={listColumns.length}
									fetchMore={fetchMore}
								/>
							}
							hideHeader={!isMdAndAbove}
						>
							{renderTableRow}
						</Table>
					</div>
				</SearchableTableWrapper>
			)}
		</>
	);
};
