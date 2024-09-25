import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import { SearchWalletListItemProperties, SearchWalletProperties } from "./SearchWallet.contracts";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { EmptyResults } from "@/app/components/EmptyResults";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { Modal } from "@/app/components/Modal";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";
import { useSearchWallet } from "@/app/hooks/use-search-wallet";
import { HeaderSearchInput } from "@/app/components/Header/HeaderSearchInput";
import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";
import { Balance, ReceiverItemMobile } from "@/app/components/WalletListItem/WalletListItem.blocks";
import { Tooltip } from "@/app/components/Tooltip";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { TableWrapper } from "@/app/components/Table/TableWrapper";
import cn from "classnames";

const SearchWalletListItem = ({
	index,
	disabled,
	alias,
	wallet,
	exchangeCurrency,
	showConvertedValue,
	onAction,
	selectedAddress,
}: SearchWalletListItemProperties) => {
	const { t } = useTranslation();

	const renderButton = () => {
		if (selectedAddress === wallet.address()) {
			return (
				<Button
					data-testid={`SearchWalletListItem__selected-${index}`}
					size="icon"
					variant="transparent"
					onClick={() => onAction({ address: wallet.address(), name: alias, network: wallet.network() })}
					className="-mr-3 text-theme-primary-reverse-600"
				>
					{t("COMMON.SELECTED")}
				</Button>
			);
		}

		return (
			<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
				<div>
					<Button
						data-testid={`SearchWalletListItem__select-${index}`}
						disabled={disabled || !isLedgerWalletCompatible(wallet)}
						size="icon"
						variant="transparent"
						className="-mr-3 text-theme-primary-600"
						onClick={() => onAction({ address: wallet.address(), name: alias, network: wallet.network() })}
					>
						{t("COMMON.SELECT")}
					</Button>
				</div>
			</Tooltip>
		);
	};

	return (
		<TableRow className="relative">
			<TableCell variant="start" innerClassName="space-x-4" className="w-full">
				<Address walletName={alias} address={wallet.address()} truncateOnTable />
			</TableCell>

			<TableCell innerClassName="font-semibold justify-end">
				<Amount value={wallet.balance()} ticker={wallet.currency()} />
			</TableCell>

			{showConvertedValue && (
				<TableCell innerClassName="text-theme-secondary-text justify-end" className="hidden xl:table-cell">
					<Amount value={wallet.convertedBalance()} ticker={exchangeCurrency} />
				</TableCell>
			)}

			<TableCell variant="end" innerClassName="justify-end">
				{renderButton()}
			</TableCell>
		</TableRow>
	);
};

const SearchSenderWalletItemResponsive = ({ alias, wallet, onAction, selectedAddress }) => {
	const { isSmAndAbove } = useBreakpoint();
	const handleButtonClick = useCallback(
		() => onAction({ address: wallet.address(), name: alias, network: wallet.network() }),
		[alias, wallet],
	);

	const isSelected = useMemo(() => selectedAddress === wallet.address(), [selectedAddress, wallet]);

	const isSynced = isFullySynced(wallet);

	return (
		<tr data-testid="SenderWalletItemResponsive--item">
			<td className="pt-3">
				<ReceiverItemMobile
					balance={
						<Balance
							className="text-sm text-white"
							wallet={wallet}
							isSynced={isSynced}
							isLargeScreen={false}
						/>
					}
					selected={isSelected}
					onClick={handleButtonClick}
					address={
						<TruncateMiddleDynamic
							data-testid="SenderWalletItemResponsive__address"
							value={wallet.address()}
							availableWidth={isSmAndAbove ? undefined : 100}
						/>
					}
					name={alias}
				/>
			</td>
		</tr>
	);
};

export const SearchWallet: FC<SearchWalletProperties> = ({
	isOpen,
	title,
	description,
	disableAction,
	wallets,
	searchPlaceholder,
	size = "5xl",
	showConvertedValue = true,
	showNetwork = true,
	onClose,
	onSelectWallet,
	profile,
	selectedAddress,
}) => {
	const { setSearchKeyword, filteredList: filteredWallets, isEmptyResults } = useSearchWallet({ profile, wallets });

	const { t } = useTranslation();

	const { isXs, isSm, isMdAndAbove } = useBreakpoint();

	const useResponsive = useMemo<boolean>(() => isXs || isSm, [isXs, isSm]);

	const columns = useMemo<Column<Contracts.IReadWriteWallet>[]>(() => {
		const commonColumns: Column<Contracts.IReadWriteWallet>[] = [
			{
				Header: t("COMMON.ADDRESS"),
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.alias(),
				headerClassName: "no-border",
			},
			{
				Header: t("COMMON.BALANCE"),
				accessor: (wallet: Contracts.IReadWriteWallet) => wallet.balance().toFixed(0),
				className: "justify-end",
				headerClassName: "no-border",
			},
		];

		if (showConvertedValue) {
			return [
				...commonColumns,
				{
					Header: t("COMMON.FIAT_VALUE"),
					accessor: (wallet: Contracts.IReadWriteWallet) => wallet.convertedBalance().toFixed(0),
					className: "justify-end",
					headerClassName: "hidden xl:table-cell",
					noWrap: true,
				},
				{
					Header: (
						<HeaderSearchBar
							placeholder={searchPlaceholder}
							offsetClassName="top-1/3 -translate-y-8 -translate-x-6"
							onSearch={setSearchKeyword}
							onReset={() => setSearchKeyword("")}
							debounceTimeout={100}
							noToggleBorder
							alwaysDisplayClearButton
						/>
					),
					accessor: "search",
					className: "justify-end",
					disableSortBy: true,
				},
			] as Column<Contracts.IReadWriteWallet>[];
		}

		return [
			...commonColumns,
			{
				Header: (
					<HeaderSearchBar
						placeholder={searchPlaceholder}
						offsetClassName="top-1/3 -translate-y-8 -translate-x-6"
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
						noToggleBorder
						alwaysDisplayClearButton
					/>
				),
				accessor: "search",
				className: "justify-end",
				disableSortBy: true,
				headerClassName: "no-border",
			},
		] as Column<Contracts.IReadWriteWallet>[];
	}, [searchPlaceholder, setSearchKeyword, showConvertedValue, t]);

	const { getWalletAlias } = useWalletAlias();

	const getWalletAliasCallback = useCallback(
		(wallet: Contracts.IReadWriteWallet) => {
			const { alias } = getWalletAlias({
				address: wallet.address(),
				network: wallet.network(),
				profile,
			});

			return alias;
		},
		[getWalletAlias, profile],
	);

	const renderTableRow = useCallback(
		(wallet: Contracts.IReadWriteWallet, index: number) => {
			const alias = getWalletAliasCallback(wallet);

			if (useResponsive) {
				return (
					<SearchSenderWalletItemResponsive
						wallet={wallet}
						alias={alias}
						onAction={onSelectWallet}
						selectedAddress={selectedAddress}
					/>
				);
			}

			return (
				<SearchWalletListItem
					index={index}
					wallet={wallet}
					alias={alias}
					disabled={disableAction?.(wallet)}
					exchangeCurrency={
						wallet.exchangeCurrency() ||
						(profile.settings().get(Contracts.ProfileSetting.ExchangeCurrency) as string)
					}
					showConvertedValue={showConvertedValue}
					showNetwork={showNetwork}
					onAction={onSelectWallet}
					selectedAddress={selectedAddress}
					profile={profile}
				/>
			);
		},
		[profile, disableAction, showConvertedValue, showNetwork, onSelectWallet, selectedAddress, useResponsive],
	);

	return (
		<Modal title={title} description={description} isOpen={isOpen} size={size} onClose={onClose} noButtons>
			<div className="mt-4">
				{useResponsive && (
					<HeaderSearchInput
						placeholder={searchPlaceholder}
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
					/>
				)}

				<TableWrapper>
					<Table
						columns={columns}
						data={filteredWallets as Contracts.IReadWriteWallet[]}
						hideHeader={useResponsive}
						className={cn({ "with-x-padding": isMdAndAbove })}
					>
						{renderTableRow}
					</Table>

					{isEmptyResults && (
						<EmptyResults
							className="mt-10"
							title={t("COMMON.EMPTY_RESULTS.TITLE")}
							subtitle={t("COMMON.EMPTY_RESULTS.SUBTITLE")}
						/>
					)}
				</TableWrapper>
			</div>
		</Modal>
	);
};
