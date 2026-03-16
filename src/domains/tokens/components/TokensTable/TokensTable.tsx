import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { Table } from "@/app/components/Table";
import { useActiveProfile, useBreakpoint } from "@/app/hooks";
import { SearchableTableWrapper } from "@/app/components/SearchableTableWrapper";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { TokensTableFooter, TokensTableHeader } from "./TokensTable.blocks";
import { TokenRow } from "@/domains/tokens/components/TokenRow/TokenRow";
import { useWalletActions } from "@/domains/wallet/hooks";
import { DeleteTokenConfirmationModal } from "@/domains/tokens/components/DeleteTokenConfirmationModal/DeleteTokenConfirmationModal";
import { TokensUnsavedChangesConfirmation } from "@/domains/tokens/components/TokensUnsavedChangesConfirmation/TokensUnsavedChangesConfirmation";

export const TokensTable = ({
	onClick,
	isManageMode,
	setManageMode,
	skeletonRowsLimit = 8,
	tokens,
	isLoadingTokens,
	isLoadingMore,
	hasMore,
	hasEmptyResults,
	fetchMore,
}: {
	onClick?: (wallet: WalletToken) => void;
	skeletonRowsLimit?: number;
	isManageMode: boolean;
	setManageMode: (isManageMode: boolean) => void;
	tokens: WalletToken[];
	isLoadingTokens: boolean;
	isLoadingMore: boolean;
	hasMore: boolean;
	hasEmptyResults: boolean;
	fetchMore: () => Promise<void>;
}) => {
	const { isMdAndAbove, isXs } = useBreakpoint();
	const activeProfile = useActiveProfile();
	const [query, setQuery] = useState("");

	const [tokenToDelete, setTokenToDelete] = useState<WalletToken | undefined>(undefined);

	// stores hidden contract addresses when in manage mode
	const [hiddenContractAddresses, setHiddenContractAddresses] = useState<string[]>([]);

	const toggleContractVisibility = (address: string) => {
		setHiddenContractAddresses((prev) => {
			if (prev.includes(address)) {
				return prev.filter((addr) => addr !== address);
			} else {
				return [...prev, address];
			}
		});
	};

	const toggleManageMode = (state: boolean) => {
		if (state) {
			// get hidden contract addresses from profile and fill `hiddenContractAddresses`
			setHiddenContractAddresses([]);
		}
		setManageMode(state);
	};

	useEffect(() => {
		setHiddenContractAddresses([]);
	}, [isManageMode]);

	const onSaveHandler = () => {
		// persist changes
		toggleManageMode(false);
	};

	const onCancelHandler = () => {
		toggleManageMode(false);
	};

	const wallets = activeProfile.wallets().selected();

	const { handleTokenSend } = useWalletActions({ wallets });

	const { t } = useTranslation();

	const showSkeleton = isLoadingTokens && tokens.length === 0;

	const skeletonRows: WalletToken[] = Array.from({ length: skeletonRowsLimit }, () => ({}) as WalletToken);
	const data = showSkeleton ? skeletonRows : tokens;

	const listColumns = useMemo<Column<WalletToken>[]>(() => {
		const columns = [
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
		];

		if (isManageMode) {
			return [
				{
					Header: t("COMMON.SHOW"),
					accessor: "show",
					cellWidth: "w-10",
					disableSortBy: true,
					headerClassName: "no-border",
					noRoundedBorders: true,
				},
				...columns,
			];
		}

		return columns;
	}, [t, isManageMode]);

	const renderTableRow = useCallback(
		(row: WalletToken) => (
			<TokenRow
				data-testid="TokensTableRow"
				isManageMode={isManageMode}
				isLoading={showSkeleton}
				onClick={() => {
					onClick?.(row);
				}}
				isDeletable={
					!showSkeleton &&
					activeProfile
						.whitelistedContractAddresses()
						.some((address) => address.toLowerCase() === row.token().address().toLowerCase())
				}
				onDelete={setTokenToDelete}
				toggleContractVisibility={toggleContractVisibility}
				isHidden={!showSkeleton && hiddenContractAddresses.includes(row.token().address())}
				onSend={() => handleTokenSend({ tokenContractAddress: row.token().address() })}
				walletToken={row}
				profile={activeProfile}
			/>
		),
		[showSkeleton, onClick, handleTokenSend, activeProfile, isManageMode, hiddenContractAddresses.length],
	);

	const isDirty = isManageMode && hiddenContractAddresses.length > 0;
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

			<SearchableTableWrapper
				innerClassName="lg:pb-28 md:pb-18 sm:pb-16 pb-18"
				searchQuery={query}
				setSearchQuery={setQuery}
				hideSearchInput={true}
				searchPlaceholder={t("TOKENS.ENTER_TOKEN_NAME")}
				searchInputWrapperClass="hidden px-6 py-4 md:flex"
				extra={
					<div className="hidden w-full items-center justify-between gap-1 md:flex">
						<TokensTableHeader
							activeProfile={activeProfile}
							isManageMode={isManageMode}
							toggleManageMode={toggleManageMode}
							onSave={onSaveHandler}
							onCancel={onCancelHandler}
						/>
					</div>
				}
			>
				<div className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 mb-4 flex items-center justify-between border-b border-dashed pb-3 md:hidden md:pt-3">
					<TokensTableHeader
						activeProfile={activeProfile}
						isManageMode={isManageMode}
						toggleManageMode={toggleManageMode}
						onSave={onSaveHandler}
						onCancel={onCancelHandler}
					/>
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

			{tokenToDelete && (
				<DeleteTokenConfirmationModal
					walletToken={tokenToDelete}
					onClose={() => setTokenToDelete(undefined)}
					onDelete={() => {
						activeProfile.removeWhitelistedContractAddress(tokenToDelete.token().address());
						setTokenToDelete(undefined);
					}}
				/>
			)}

			<TokensUnsavedChangesConfirmation isDirty={isDirty} />
		</>
	);
};
