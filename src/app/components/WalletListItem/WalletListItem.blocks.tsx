import cn from "classnames";
import React, { useCallback, useEffect } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";
import { WalletListItemMobileProperties } from "@/app/components/WalletListItem";
import { Address } from "@/app/components/Address";
import { Amount } from "@/app/components/Amount";
import { Button } from "@/app/components/Button";
import { Dropdown } from "@/app/components/Dropdown";
import { Icon } from "@/app/components/Icon";
import { TableCell } from "@/app/components/Table";
import { Tooltip } from "@/app/components/Tooltip";
import { WalletIcons, WalletIconsSkeleton } from "@/app/components/WalletIcons";
import {
	BalanceProperties,
	ButtonsCellProperties,
	CurrencyProperties,
	WalletCellProperties,
	StarredProperties,
	InfoProperties,
	RecipientItemMobileProperties,
	ReceiverItemMobileProperties,
} from "@/app/components/WalletListItem/WalletListItem.contracts";
import { useConfiguration } from "@/app/contexts";
import { useActiveProfile, useBreakpoint, useWalletAlias } from "@/app/hooks";
import { useWalletOptions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-options";
import { Skeleton } from "@/app/components/Skeleton";
import { useWalletActions } from "@/domains/wallet/hooks";
import { useWalletTransactions } from "@/domains/wallet/pages/WalletDetails/hooks/use-wallet-transactions";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";
import { TruncateEnd } from "@/app/components/TruncateEnd";

const starIconDimensions: [number, number] = [18, 18];
const excludedIcons = ["isStarred"];

export const Starred: React.VFC<StarredProperties> = ({ wallet, onToggleStar, isLargeScreen = true }) => {
	const { t } = useTranslation();

	if (!isLargeScreen) {
		return (
			<div
				data-testid="WalletIcon__Starred"
				onClick={onToggleStar}
				className="flex shrink-0 items-center justify-center"
			>
				<Icon
					className="text-theme-warning-400"
					name={wallet.isStarred() ? "StarFilled" : "Star"}
					dimensions={starIconDimensions}
				/>
			</div>
		);
	}

	return (
		<TableCell variant="start" size="sm" innerClassName="space-x-3 pl-6 ml-0" data-testid="TableCell_Starred">
			<div className="flex h-5 items-center pr-3 dark:border-theme-secondary-800">
				<Tooltip
					content={
						wallet.isStarred()
							? t("WALLETS.PAGE_WALLET_DETAILS.UNSTAR_WALLET")
							: t("WALLETS.PAGE_WALLET_DETAILS.STAR_WALLET")
					}
				>
					<div
						data-testid="WalletIcon__Starred"
						onClick={onToggleStar}
						className="flex shrink-0 items-center justify-center"
					>
						<Icon
							className="text-theme-warning-400"
							name={wallet.isStarred() ? "StarFilled" : "Star"}
							dimensions={starIconDimensions}
						/>
					</div>
				</Tooltip>
			</div>
		</TableCell>
	);
};

export const WalletCell: React.VFC<WalletCellProperties> = ({ wallet }) => {
	const profile = useActiveProfile();
	const { getWalletAlias } = useWalletAlias();

	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile: profile,
	});

	return (
		<TableCell size="sm" innerClassName="-ml-3 space-x-3" data-testid="TableCell_Wallet">
			<div className="w-full max-w-64 flex-1 overflow-hidden md:max-w-40 lg:max-w-48 xl:max-w-full">
				<Address
					address={wallet.address()}
					addressClass="text-sm text-theme-secondary-700 dark:text-theme-secondary-500 lg:!ml-0"
					walletName={alias}
					walletNameClass="lg:hidden text-sm text-theme-text group-hover:text-theme-primary-700"
					showCopyButton
					wrapperClass="justify-between"
				/>
			</div>
		</TableCell>
	);
};

export const Info = ({ wallet, isLargeScreen = true, className }: InfoProperties) => {
	const { t } = useTranslation();
	const { syncPending, hasUnsignedPendingTransaction, isLoading } = useWalletTransactions(wallet);

	useEffect(() => {
		syncPending();
	}, []); // eslint-disable-line react-hooks/exhaustive-deps

	const renderIcons = () => (
		<div className={cn("inline-flex items-center space-x-1", className)}>
			{isLoading && <WalletIconsSkeleton />}

			{!isLoading && (
				<>
					{hasUnsignedPendingTransaction && (
						<Tooltip content={t("TRANSACTION.MULTISIGNATURE.AWAITING_SOME_SIGNATURES")}>
							<span data-testid="PendingTransactionIcon">
								<Icon
									name="ClockPencil"
									className="text-theme-warning-300"
									size={isLargeScreen ? "lg" : "md"}
								/>
							</span>
						</Tooltip>
					)}

					<WalletIcons exclude={excludedIcons} wallet={wallet} iconSize={isLargeScreen ? "lg" : "md"} />
				</>
			)}
		</div>
	);

	if (!isLargeScreen) {
		return renderIcons();
	}

	return (
		<TableCell innerClassName="justify-center text-sm font-bold text-center align-middle">
			{renderIcons()}
		</TableCell>
	);
};

export const Balance: React.VFC<BalanceProperties> = ({ wallet, isSynced, isLargeScreen = true, className }) => {
	const renderAmount = () => {
		if (isSynced) {
			return (
				<Amount
					value={wallet.balance()}
					ticker={wallet.network().ticker()}
					className={cn(
						"dark:text-theme-white text-theme-secondary-700 dark:md:text-theme-secondary-500",
						className,
					)}
				/>
			);
		}

		return <Skeleton height={16} width={100} />;
	};

	if (!isLargeScreen) {
		return renderAmount();
	}

	return <TableCell innerClassName="font-semibold justify-end">{renderAmount()}</TableCell>;
};

export const Currency: React.VFC<CurrencyProperties> = ({ wallet, isSynced, isLargeScreen = true }) => {
	const { profileIsSyncingExchangeRates } = useConfiguration();
	const { t } = useTranslation();

	const renderCurrency = () => {
		if (wallet.network().isTest()) {
			return (
				<span className="text-xs font-semibold text-theme-navy-200 md:text-base md:text-theme-secondary-500 dark:md:text-theme-secondary-700">
					{t("COMMON.NOT_AVAILABLE")}
				</span>
			);
		}

		if (profileIsSyncingExchangeRates || !isSynced) {
			return <Skeleton height={16} width={100} />;
		}

		return (
			<Amount
				className="text-xs font-semibold text-theme-navy-200 dark:text-white md:text-base md:text-theme-secondary-700 dark:md:text-theme-secondary-500"
				ticker={wallet.exchangeCurrency()}
				value={wallet.convertedBalance()}
			/>
		);
	};

	if (!isLargeScreen) {
		return renderCurrency();
	}

	return (
		<TableCell data-testid="CurrencyCell" innerClassName="justify-end" className="hidden lg:table-cell">
			{renderCurrency()}
		</TableCell>
	);
};

export const WalletItemDetails = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { getWalletAlias } = useWalletAlias();

	const profile = useActiveProfile();

	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile: profile,
	});

	return (
		<Address
			walletName={alias}
			walletNameClass="text-sm text-theme-text leading-[17px]"
			address={wallet.address()}
			addressClass="text-sm leading-[17px] text-theme-secondary-700 dark:text-theme-secondary-500"
			showCopyButton
		/>
	);
};

export const WalletItemExtraDetails = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { handleToggleStar } = useWalletActions(wallet);

	return (
		<>
			<Info
				className="border-r border-theme-secondary-300 pr-3 empty:border-r-0 dark:border-theme-secondary-800"
				wallet={wallet}
				isLargeScreen={false}
			/>

			<Starred onToggleStar={handleToggleStar} wallet={wallet} isLargeScreen={false} />
		</>
	);
};

export const WalletItemBalance = ({ wallet, isSynced }: { wallet: Contracts.IReadWriteWallet; isSynced: boolean }) => (
	<>
		<Balance className="text-sm text-white" wallet={wallet} isSynced={isSynced} isLargeScreen={false} />

		<Currency wallet={wallet} isSynced={isSynced} isLargeScreen={false} />
	</>
);

export const WalletListItemMobile: React.VFC<WalletListItemMobileProperties> = ({
	onClick,
	onButtonClick,
	buttonLabel,
	isButtonDisabled,
	details,
	balance,
	extraDetails,
	selected = false,
}) => {
	const handleStopPropagation = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	return (
		<div
			data-testid={selected ? "WalletListItemMobile--selected" : "WalletListItemMobile"}
			className={cn(
				"w-full rounded-xl bg-theme-primary-100 p-2 text-left focus:outline-none focus:ring-2 focus:ring-theme-primary-400 dark:bg-theme-background focus:dark:ring-theme-primary-400",
				{
					"dark:ring-2 dark:ring-theme-secondary-800": !selected,
					"ring-2 ring-theme-primary-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex items-center space-x-4 p-2 pl-4">
				<div className="flex min-w-0 flex-1 flex-shrink flex-col">{details}</div>

				{extraDetails && <div className="flex items-center space-x-3 self-start">{extraDetails}</div>}
			</div>

			{(balance !== undefined || onButtonClick !== undefined) && (
				<div className="mt-2 flex overflow-hidden rounded-xl">
					{balance !== undefined && (
						<div className="flex flex-1 flex-col justify-between space-y-1 bg-theme-primary-500 px-4 py-3 font-semibold">
							{balance}
						</div>
					)}

					{onButtonClick !== undefined && (
						<div
							className={cn("flex", {
								"flex-grow": balance === undefined,
							})}
							onClick={handleStopPropagation}
						>
							<button
								data-testid="WalletListItemMobile--button"
								className={cn({
									"bg-theme-primary-600 text-white": !isButtonDisabled,
									"cursor-not-allowed bg-theme-primary-500 text-theme-primary-400": isButtonDisabled,
									"flex flex-grow items-center justify-center px-3 py-3 font-semibold": true,
								})}
								type="button"
								disabled={isButtonDisabled}
								onClick={(event) => onButtonClick(event)}
							>
								{buttonLabel || <Icon name="DoubleArrowRight" size="lg" />}
							</button>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export const RecipientItemMobile: React.FC<RecipientItemMobileProperties> = ({
	onClick,
	selected = false,
	type,
	address,
	name,
}) => {
	const { isSmAndAbove } = useBreakpoint();
	const maxCharacters = isSmAndAbove ? 20 : 10;

	return (
		<div
			data-testid={selected ? "WalletListItemMobile--selected" : "WalletListItemMobile"}
			className={cn(
				"flex w-full cursor-pointer flex-row rounded-xl border-2 bg-theme-primary-100 dark:bg-theme-background",
				{
					"border-theme-primary-100 dark:border-theme-secondary-800": !selected,
					"border-theme-primary-600 dark:border-theme-primary-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex h-full w-full flex-col items-start justify-center gap-1.5 p-4">
				<div className="flex flex-row gap-1.5">
					<span className="truncate text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
						<TruncateEnd text={name} maxChars={maxCharacters} showTooltip={name.length > maxCharacters} />
					</span>
					<span className="text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
						({type})
					</span>
				</div>

				{address}
			</div>
			<div
				className={cn("flex w-11 items-center justify-center", {
					"rounded-r-lg bg-theme-primary-600 dark:bg-theme-primary-600": selected,
					"rounded-r-xl bg-theme-primary-100 dark:bg-theme-background": !selected,
				})}
			>
				<div>
					<Icon
						className={cn({
							"text-theme-primary-200 dark:text-theme-secondary-800": !selected,
							"text-theme-primary-50": selected,
						})}
						name="CircleCheckMark"
						size="lg"
					/>
				</div>
			</div>
		</div>
	);
};

export const ReceiverItemMobile: React.FC<ReceiverItemMobileProperties> = ({
	onClick,
	selected = false,
	balance,
	address,
	name,
}) => {
	const { t } = useTranslation();

	return (
		<div
			data-testid={selected ? "ReceiverItemMobile--selected" : "ReceiverItemMobile"}
			className={cn(
				"flex h-[117px] w-full cursor-pointer flex-col gap-3 rounded-xl bg-theme-primary-100 p-2 ring-2 dark:bg-theme-background",
				{
					"ring-theme-primary-100 dark:ring-theme-secondary-800": !selected,
					"ring-theme-primary-600 dark:ring-theme-primary-600": selected,
				},
			)}
			tabIndex={onClick ? 0 : -1}
			onClick={onClick}
		>
			<div className="flex flex-col gap-2 pl-2 pt-2">
				<span className="text-sm font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
					{name}
				</span>
				<span className="text-xs font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
					{address}
				</span>
			</div>

			<div className="flex flex-row items-center justify-between overflow-hidden rounded-lg bg-theme-primary-500 text-sm font-semibold text-white">
				<div className="pl-2">{balance}</div>
				<button className="flex h-full items-center justify-center bg-theme-primary-600 px-5 py-3">
					{t("COMMON.SELECT")}
				</button>
			</div>
		</div>
	);
};

export const ButtonsCell: React.VFC<ButtonsCellProperties> = ({ wallet, onSend, onSelectOption }) => {
	const { t } = useTranslation();
	const { primaryOptions, secondaryOptions } = useWalletOptions(wallet);

	const isRestoring = !wallet.hasBeenFullyRestored();
	const isButtonDisabled =
		wallet.balance() === 0 || isRestoring || !wallet.hasSyncedWithNetwork() || !isLedgerWalletCompatible(wallet);

	const handleStopPropagation = useCallback((event: React.MouseEvent) => {
		event.preventDefault();
		event.stopPropagation();
	}, []);

	return (
		<TableCell variant="end" size="sm" innerClassName="justify-end text-theme-secondary-text pr-6">
			<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
				<div onClick={handleStopPropagation}>
					<Button
						data-testid="WalletListItem__send-button"
						size="icon"
						disabled={isButtonDisabled}
						variant="transparent"
						className="pr-0 text-sm text-theme-primary-600 hover:text-theme-primary-700"
						onClick={onSend}
					>
						<div className="border-r border-theme-secondary-300 pr-3 dark:border-theme-secondary-800">
							{t("COMMON.SEND")}
						</div>
					</Button>
				</div>
			</Tooltip>
			<div data-testid="WalletListItem__more-button">
				<Dropdown
					position="bottom-end"
					toggleContent={
						<Button
							variant="transparent"
							size="icon"
							disabled={isRestoring}
							className="text-theme-gray-700 -mr-1.5 hover:text-theme-primary-600"
						>
							<Icon name="EllipsisVerticalFilled" size="lg" />
						</Button>
					}
					onSelect={onSelectOption}
					options={[primaryOptions, secondaryOptions]}
				/>
			</div>
		</TableCell>
	);
};
