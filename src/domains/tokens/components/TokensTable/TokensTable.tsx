import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { Table } from "@/app/components/Table";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { Toggle } from "@/app/components/Toggle";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokensTableFooter } from "./TokensTable.blocks";
import { useProfileTokens } from "@/domains/transaction/hooks/use-profile-tokens";
import { TokenRow } from "@/domains/tokens/components/TokenRow/TokenRow";
import { Contracts } from "@/app/lib/profiles";
import { useWalletActions } from "@/domains/wallet/hooks";

export const TokensTable = ({ onClick }: { onClick?: (wallet: WalletToken) => void }) => {
	const { isMdAndAbove, isXs, isSmAndAbove } = useBreakpoint();
	const activeProfile = useActiveProfile();
	const [query, setQuery] = useState("");

	const wallets = activeProfile.wallets().selected();

	const { tokens, isLoadingTokens, isLoadingMore, hasMore, hasEmptyResults, fetchMore } = useProfileTokens({
		profile: activeProfile,
		wallets,
	});

	const { handleSend } = useWalletActions({ wallets });

	const { t } = useTranslation();

	const listColumns = useMemo<Column<WalletToken>[]>(
		() => [
			{
				Header: t("COMMON.NAME"),
				accessor: (walletToken: WalletToken) => walletToken.token().name(),
				cellWidth: "w-32 xl:w-40",
				headerClassName: "no-border",
				noRoundedBorders: true,
			},
			{
				Header: t("COMMON.SYMBOL"),
				accessor: (walletToken: WalletToken) => walletToken.token().symbol(),
				cellWidth: "w-28",
				headerClassName: "no-border hidden md-lg:table-cell",
			},
			{
				Header: t("COMMON.CONTRACT"),
				accessor: (walletToken: WalletToken) => walletToken.token().address(),
				cellWidth: "w-48 xl:w-40",
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.TOKEN_BALANCE"),
				accessor: (walletToken: WalletToken) => walletToken.balance(),
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
				accessor: (walletToken: WalletToken) => walletToken.token().address(),
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border",
				minimumWidth: true,
			},
		],
		[t],
	);

	const renderTableRow = useCallback(
		(row: WalletToken) => (
			<TokenRow
				isLoading={isLoadingTokens}
				onClick={() => {
					onClick?.(row);
				}}
				onSend={() => handleSend()}
				walletToken={row}
				profile={activeProfile}
			/>
		),
		[],
	);

	const shouldRenderTable = wallets.length === 1 && ((isXs && tokens.length > 0) || isSmAndAbove);

	return (
		<>
			{isXs && tokens.length === 0 && (
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
						<div className="mr-6 flex items-center space-x-2">
							<div className="text-theme-secondary-700 dark:text-theme-dark-200 dim:text-theme-dim-200 font-semibold whitespace-nowrap">
								{t("TOKENS.HIDE_DUST")}
							</div>

							<Toggle
								disabled
								name="hideDust"
								defaultChecked={false}
								data-testid="Tokens__toggle-Toggle"
							/>
						</div>
					}
				>
					<div data-testid="TokenList">
						<Table
							columns={listColumns}
							data={tokens}
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
