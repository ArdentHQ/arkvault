import cn from "classnames";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { FC, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Column } from "react-table";
import {
	SearchWalletListItemProperties,
	SearchWalletListItemResponsiveProperties,
	SearchWalletProperties,
} from "./SearchWallet.contracts";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Avatar } from "@/app/components/Avatar";
import { Button } from "@/app/components/Button";
import { EmptyResults } from "@/app/components/EmptyResults";
import { HeaderSearchBar } from "@/app/components/Header/HeaderSearchBar";
import { Modal } from "@/app/components/Modal";
import { Table, TableCell, TableRow } from "@/app/components/Table";
import { useBreakpoint, useWalletAlias } from "@/app/hooks";
import { useSearchWallet } from "@/app/hooks/use-search-wallet";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { HeaderSearchInput } from "@/app/components/Header/HeaderSearchInput";
import { isFullySynced } from "@/domains/wallet/utils/is-fully-synced";
import {
	Balance,
	WalletListItemMobile,
	WalletItemDetails,
	ReceiverItemMobile,
} from "@/app/components/WalletListItem/WalletListItem.blocks";
import { Tooltip } from "@/app/components/Tooltip";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";

const SearchWalletListItem = ({
	index,
	disabled,
	alias,
	wallet,
	exchangeCurrency,
	showConvertedValue,
	onAction,
	selectedAddress,
	isCompact,
}: SearchWalletListItemProperties) => {
	const { t } = useTranslation();

	const renderButton = () => {
		if (selectedAddress === wallet.address()) {
			return (
				<Button
					data-testid={`SearchWalletListItem__selected-${index}`}
					size={isCompact ? "icon" : undefined}
					variant={isCompact ? "transparent" : "reverse"}
					onClick={() => onAction({ address: wallet.address(), name: alias, network: wallet.network() })}
					className={cn("text-theme-primary-reverse-600", { "-mr-3": isCompact })}
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
						size={isCompact ? "icon" : undefined}
						variant={isCompact ? "transparent" : "secondary"}
						className={cn("text-theme-primary-600", { "-mr-3": isCompact })}
						onClick={() => onAction({ address: wallet.address(), name: alias, network: wallet.network() })}
					>
						{t("COMMON.SELECT")}
					</Button>
				</div>
			</Tooltip>
		);
	};

	return (
		<TableRow>
			<TableCell isCompact={isCompact} variant="start" innerClassName="space-x-4" className="w-full">
				<Address walletName={alias} address={wallet.address()} truncateOnTable />
			</TableCell>

			<TableCell isCompact={isCompact} innerClassName="font-semibold justify-end">
				<Amount value={wallet.balance()} ticker={wallet.currency()} />
			</TableCell>

			{showConvertedValue && (
				<TableCell
					isCompact={isCompact}
					innerClassName="text-theme-secondary-text justify-end"
					className="hidden xl:table-cell"
				>
					<Amount value={wallet.convertedBalance()} ticker={exchangeCurrency} />
				</TableCell>
			)}

			<TableCell isCompact={isCompact} variant="end" innerClassName="justify-end">
				{renderButton()}
			</TableCell>
		</TableRow>
	);
};

const SearchWalletAvatar = ({
	wallet,
	isCompact,
	showNetwork,
	avatarShadowClassName,
	networkIconShadowClassName,
	networkIconClassName,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	isCompact: boolean;
	showNetwork?: boolean;
	avatarShadowClassName?: string;
	networkIconShadowClassName?: string;
	networkIconClassName?: string;
	profile: Contracts.IProfile;
}) => {
	const network = useMemo(
		() => profile.availableNetworks().find((network) => network.id() === wallet?.networkId()),
		[wallet, profile],
	);

	if (isCompact) {
		return (
			<div data-testid="SearchWalletAvatar--compact" className="flex shrink-0 space-x-3">
				{showNetwork && (
					<NetworkIcon
						size="xs"
						network={network}
						className="border-transparent dark:border-transparent"
						shadowClassName={networkIconShadowClassName}
					/>
				)}
				<Avatar shadowClassName={avatarShadowClassName} size="xs" address={wallet.address()} />
			</div>
		);
	}

	return (
		<div className="flex shrink-0 -space-x-1">
			{showNetwork && (
				<NetworkIcon
					size="lg"
					network={wallet.network()}
					shadowClassName={networkIconShadowClassName}
					className={networkIconClassName}
				/>
			)}
			<Avatar shadowClassName={avatarShadowClassName} size="lg" address={wallet.address()} />
		</div>
	);
};

const SearchSenderWalletItemResponsive = ({
	alias,
	wallet,
	onAction,
	selectedAddress,
}) => {
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
							isCompact={false}
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
	)
}

const SearchWalletListItemResponsive = ({
	alias,
	wallet,
	onAction,
	selectedAddress,
	showNetwork,
	profile,
}: SearchWalletListItemResponsiveProperties) => {
	const handleButtonClick = useCallback(
		() => onAction({ address: wallet.address(), name: alias, network: wallet.network() }),
		[alias, wallet],
	);

	const isSelected = useMemo(() => selectedAddress === wallet.address(), [selectedAddress, wallet]);

	const isSynced = isFullySynced(wallet);

	return (
		<tr data-testid="SearchWalletListItemResponsive--item">
			<td className="pt-3">
				<WalletListItemMobile
					avatar={
						<SearchWalletAvatar
							wallet={wallet}
							isCompact={false}
							showNetwork={showNetwork}
							avatarShadowClassName="ring-theme-success-100 dark:ring-theme-secondary-900"
							networkIconClassName="text-theme-primary-300 dark:text-theme-secondary-800"
							networkIconShadowClassName="ring-theme-success-100 dark:ring-theme-secondary-900"
							profile={profile}
						/>
					}
					details={<WalletItemDetails wallet={wallet} />}
					balance={
						<Balance
							className="text-sm text-white"
							wallet={wallet}
							isCompact={false}
							isSynced={isSynced}
							isLargeScreen={false}
						/>
					}
					selected={isSelected}
					onClick={handleButtonClick}
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

	const { isXs, isSm, isLgAndAbove } = useBreakpoint();

	const isCompact = useMemo<boolean>(
		() => !isLgAndAbove || !profile.appearance().get("useExpandedTables"),
		[isLgAndAbove, profile],
	);
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
							offsetClassName="top-1/3 -translate-y-16 -translate-x-6"
							onSearch={setSearchKeyword}
							onReset={() => setSearchKeyword("")}
							debounceTimeout={100}
							noToggleBorder
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
						offsetClassName="top-1/3 -translate-y-16 -translate-x-6"
						onSearch={setSearchKeyword}
						onReset={() => setSearchKeyword("")}
						debounceTimeout={100}
						noToggleBorder
					/>
				),
				accessor: "search",
				className: "justify-end",
				headerClassName: "no-border",
				disableSortBy: true,
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
					isCompact={isCompact}
					profile={profile}
				/>
			);
		},
		[
			profile,
			disableAction,
			showConvertedValue,
			showNetwork,
			onSelectWallet,
			selectedAddress,
			isCompact,
			useResponsive,
		],
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

				<div className="rounded-xl border border-b-[5px] 	border-transparent md:border-theme-secondary-300 dark:md:border-theme-secondary-800">
					<Table
						columns={columns}
						data={filteredWallets as Contracts.IReadWriteWallet[]}
						hideHeader={useResponsive}
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
				</div>
			</div>
		</Modal>
	);
};
