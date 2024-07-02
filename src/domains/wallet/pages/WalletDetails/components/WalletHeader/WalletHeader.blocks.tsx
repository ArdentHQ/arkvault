import React, { useCallback, useEffect, useState, VFC } from "react";
import { useTranslation } from "react-i18next";
import { Contracts } from "@ardenthq/sdk-profiles";
import cn from "classnames";
import tw, { styled } from "twin.macro";
import { Enums } from "@ardenthq/sdk";
import { useResizeDetector } from "react-resize-detector";
import { WalletActionsProperties, WalletAddressProperties, WalletBalanceProperties } from "./WalletHeader.contracts";
import { Amount } from "@/app/components/Amount";
import { Icon } from "@/app/components/Icon";
import { assertString } from "@/utils/assertions";
import { Tooltip } from "@/app/components/Tooltip";
import { Button } from "@/app/components/Button";
import { useEnvironmentContext } from "@/app/contexts";
import { useWalletActions, useWalletSync } from "@/domains/wallet/hooks";
import { usePrevious, useWalletAlias } from "@/app/hooks";
import { NetworkIcon } from "@/domains/network/components/NetworkIcon";
import { Avatar } from "@/app/components/Avatar";
import { WalletIcons } from "@/app/components/WalletIcons";
import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";
import { Clipboard } from "@/app/components/Clipboard";
import { isLedgerWalletCompatible } from "@/utils/wallet-utils";

const WalletHeaderButton = styled.button`
	${tw`inline-flex items-center justify-center w-8 h-8 transition-all duration-100 ease-linear rounded outline-none focus:(outline-none ring-2 ring-theme-primary-400) text-theme-secondary-text hover:text-theme-secondary-500 disabled:(cursor-not-allowed text-theme-secondary-800)`}
`;

const isUnlockBalanceButtonVisible = (wallet: Contracts.IReadWriteWallet) => {
	const hasLockedBalance = wallet.network().usesLockedBalance() && !!wallet.balance("locked");

	if (!wallet.isLedger()) {
		return hasLockedBalance && wallet.network().allows(Enums.FeatureFlag.TransactionUnlockToken);
	}

	return (
		(hasLockedBalance && wallet.network().allows(Enums.FeatureFlag.TransactionUnlockTokenLedgerS)) ||
		wallet.network().allows(Enums.FeatureFlag.TransactionUnlockTokenLedgerX)
	);
};

export const WalletAddress: VFC<WalletAddressProperties> = ({ profile, wallet }) => {
	const { t } = useTranslation();

	const { ref } = useResizeDetector<HTMLSpanElement>({ handleHeight: false });

	const { getWalletAlias } = useWalletAlias();
	const { alias } = getWalletAlias({
		address: wallet.address(),
		network: wallet.network(),
		profile,
	});

	return (
		<div className="h-13 flex w-full flex-row-reverse items-center justify-between lg:w-1/2 lg:flex-row lg:pr-12">
			<div className="flex -space-x-1">
				<NetworkIcon
					network={wallet.network()}
					size="lg"
					className="border-theme-secondary-700 text-theme-secondary-text"
					noShadow
					tooltipDarkTheme
				/>
				<Avatar size="lg" address={wallet.address()} shadowClassName="ring-theme-secondary-900" />
			</div>

			<div className="-my-2 mr-4 flex w-full flex-col overflow-hidden py-2 lg:-mr-2 lg:ml-4">
				<div className="flex items-center space-x-2 text-theme-secondary-text">
					{!!alias && (
						<span data-testid="WalletHeader__name" className="text-sm font-semibold">
							{alias}
						</span>
					)}

					<div className="flex items-center space-x-1">
						<WalletIcons
							wallet={wallet}
							iconColor="text-theme-secondary-text"
							iconSize="md"
							exclude={["isStarred", "isTestNetwork"]}
							tooltipDarkTheme
						/>
					</div>
				</div>

				<div className="flex w-full items-center space-x-5">
					<span className="min-w-0" ref={ref}>
						<TruncateMiddleDynamic
							value={wallet.address()}
							className="no-ligatures whitespace-nowrap text-lg font-semibold text-white"
							parentRef={ref as React.RefObject<HTMLElement>}
							tooltipDarkTheme
						/>
					</span>

					<div className="mb-1 flex items-end space-x-3 text-theme-secondary-text">
						<Clipboard
							variant="icon"
							data={wallet.address()}
							tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_ADDRESS")}
							tooltipDarkTheme
						>
							<Icon name="Copy" className="hover:text-theme-secondary-500" />
						</Clipboard>

						{!!wallet.publicKey() && (
							<Clipboard
								variant="icon"
								data={wallet.publicKey() as string}
								tooltip={t("WALLETS.PAGE_WALLET_DETAILS.COPY_PUBLIC_KEY")}
								tooltipDarkTheme
							>
								<Icon name="CopyKey" className="hover:text-theme-secondary-500" />
							</Clipboard>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

export const WalletBalance: VFC<WalletBalanceProperties> = ({ profile, wallet, currencyDelta }) => {
	const { t } = useTranslation();

	const exchangeCurrency = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency);
	assertString(exchangeCurrency);

	const renderLockBalance = useCallback(() => {
		if (!isUnlockBalanceButtonVisible(wallet)) {
			return;
		}

		return (
			<div className="ml-1 flex items-baseline space-x-1 text-theme-secondary-700">
				<span className="text-lg font-semibold">/</span>
				<div className="flex items-center space-x-2" data-testid="WalletHeader__balance-locked">
					<Amount
						value={wallet.balance("locked")}
						ticker={wallet.currency()}
						className="text-sm font-semibold"
					/>
					<Icon name="Lock" />
				</div>
			</div>
		);
	}, [wallet]);

	return (
		<div className="mr-auto flex flex-col">
			<div className="flex items-center text-sm font-semibold text-theme-secondary-text">
				<span>{t("COMMON.BALANCE")}:</span>

				{!wallet.network().isTest() && (
					<Amount
						value={wallet.convertedBalance()}
						ticker={exchangeCurrency}
						data-testid="WalletHeader__currency-balance"
						className="ml-1"
					/>
				)}

				{!!currencyDelta && (
					<span
						className={`ml-2 inline-flex items-center ${
							currencyDelta > 0 ? "text-theme-success-600" : "text-theme-danger-500"
						}`}
					>
						<Icon name={currencyDelta > 0 ? "ChevronUpSmall" : "ChevronDownSmall"} size="sm" />
						<span className="ml-1">{currencyDelta}%</span>
					</span>
				)}
			</div>

			<div className="flex items-center">
				<Amount
					value={wallet.balance()}
					ticker={wallet.currency()}
					data-testid="WalletHeader__balance"
					className="text-lg font-semibold text-white"
				/>

				{renderLockBalance()}
			</div>
		</div>
	);
};

export const WalletActions: VFC<WalletActionsProperties> = ({
	profile,
	wallet,
	isUpdatingTransactions,
	onUpdate,
	setActiveModal,
}) => {
	const { env } = useEnvironmentContext();
	const { syncAll } = useWalletSync({ env, profile });
	const [isSyncing, setIsSyncing] = useState(false);
	const previousIsUpdatingTransactions = usePrevious(isUpdatingTransactions);

	const { t } = useTranslation();

	const { handleToggleStar, handleSend } = useWalletActions(wallet);

	const syncWallet = async () => {
		onUpdate?.(true);
		setIsSyncing(true);

		await syncAll(wallet);

		if (isUpdatingTransactions === undefined) {
			setIsSyncing(false);
			onUpdate?.(false);
		}
	};

	useEffect(() => {
		if (isSyncing && previousIsUpdatingTransactions && !isUpdatingTransactions) {
			setIsSyncing(false);
			onUpdate?.(false);
		}
	}, [isSyncing, previousIsUpdatingTransactions, isUpdatingTransactions, onUpdate]);

	const renderLockedButton = useCallback(() => {
		if (!isUnlockBalanceButtonVisible(wallet)) {
			return;
		}

		return (
			<Tooltip content={t("TRANSACTION.UNLOCK_TOKENS.LOCKED_BALANCE")} theme="dark">
				<Button
					variant="transparent"
					size="icon"
					className="my-auto ml-3 bg-theme-secondary-800 text-white hover:bg-theme-primary-700"
					data-testid="WalletHeader__locked-balance-button"
					onClick={() => setActiveModal("unlockable-balances")}
				>
					<Icon name="Lock" size="lg" />
				</Button>
			</Tooltip>
		);
	}, [setActiveModal, t, wallet]);

	return (
		<>
			<div className="my-auto flex items-center space-x-3">
				<Tooltip
					content={isSyncing ? t("WALLETS.UPDATING_WALLET_DATA") : t("WALLETS.UPDATE_WALLET_DATA")}
					theme="dark"
					disabled={!wallet.hasSyncedWithNetwork()}
				>
					<WalletHeaderButton
						data-testid="WalletHeader__refresh"
						type="button"
						aria-busy={isSyncing}
						onClick={syncWallet}
						disabled={isSyncing}
					>
						<Icon
							name="ArrowRotateLeft"
							className={cn({ "animate-spin": isSyncing })}
							style={{ animationDirection: "reverse" }}
						/>
					</WalletHeaderButton>
				</Tooltip>

				<Tooltip
					content={
						wallet.isStarred()
							? t("WALLETS.PAGE_WALLET_DETAILS.UNSTAR_WALLET")
							: t("WALLETS.PAGE_WALLET_DETAILS.STAR_WALLET")
					}
					theme="dark"
				>
					<WalletHeaderButton
						data-testid="WalletHeader__star-button"
						type="button"
						onClick={handleToggleStar}
					>
						<Icon
							className={cn({ "text-theme-warning-400": wallet.isStarred() })}
							name={wallet.isStarred() ? "StarFilled" : "Star"}
						/>
					</WalletHeaderButton>
				</Tooltip>
			</div>
			<Tooltip content={isLedgerWalletCompatible(wallet) ? "" : t("COMMON.LEDGER_COMPATIBILITY_ERROR")}>
				<div>
					<Button
						data-testid="WalletHeader__send-button"
						disabled={
							wallet.balance() === 0 ||
							!wallet.hasBeenFullyRestored() ||
							!wallet.hasSyncedWithNetwork() ||
							!isLedgerWalletCompatible(wallet)
						}
						className="bg-theme-dark-500 my-auto ml-3"
						theme="dark"
						onClick={handleSend}
					>
						{t("COMMON.SEND")}
					</Button>
				</div>
			</Tooltip>
			{renderLockedButton()}
		</>
	);
};
