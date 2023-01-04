import React, { useCallback, useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import cn from "classnames";
import { generatePath } from "react-router";
import { useHistory } from "react-router-dom";
import { useMetaMask } from "@/domains/migration/hooks/use-meta-mask";
import SelectPolygonAddress from "@/domains/migration/components/SelectPolygonAddress";
import MigrationStep from "@/domains/migration/components/MigrationStep";
import { FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveProfile } from "@/app/hooks";
import { Amount } from "@/app/components/Amount";
import { Link } from "@/app/components/Link";
import { images } from "@/app/assets/images";
import { useLink } from "@/app/hooks/use-link";
import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import { ProfilePaths } from "@/router/paths";
const { MetamaskLogo } = images.common;

/* istanbul ignore next -- @preserve */
const TRANSACTION_FEE = Number.parseFloat(import.meta.env.VITE_POLYGON_MIGRATION_TRANSACTION_FEE || 0.05);

// @TBD
const MIGRATION_GUIDE_URL = "https://arkvault.io/docs";
// @TBD
const METAMASK_URL = "https://metamask.io/";

const MetaMaskButton = ({
	children,
	className,
	onClick,
}: {
	children: React.ReactNode;
	className?: string;
	onClick: () => void;
}) => (
	<button
		data-testid="MigrationConnectStep__metamask-button"
		type="button"
		className={cn(
			"group relative overflow-hidden rounded-lg bg-gradient-to-r from-[#FFDB80] to-theme-warning-800",
			className,
		)}
		onClick={onClick}
	>
		<span className="absolute inset-0 bg-gradient-to-r from-theme-warning-200 to-theme-navy-500 opacity-0 transition-all duration-200 ease-in-out group-hover:opacity-100" />

		<div className="relative flex justify-center space-x-2 py-3.5 px-5">
			<MetamaskLogo />
			<span className="font-semibold text-white">{children}</span>
		</div>
	</button>
);

const PolygonFieldMessage = ({
	needsMetaMask,
	supportsMetaMask,
}: {
	needsMetaMask: boolean;
	supportsMetaMask: boolean;
}) => {
	if (!supportsMetaMask) {
		return (
			<Trans
				i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_METAMASK_BROWSER"
				components={{
					linkMigrationGuide: <Link to={MIGRATION_GUIDE_URL} isExternal />,
				}}
			/>
		);
	}

	if (needsMetaMask) {
		return (
			<Trans
				i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_METAMASK"
				components={{
					linkMigrationGuide: <Link to={MIGRATION_GUIDE_URL} isExternal />,
				}}
			/>
		);
	}

	return (
		<Trans
			i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_CONNECTED_WALLET"
			components={{
				linkMetamask: <Link to={METAMASK_URL} isExternal />,
			}}
		/>
	);
};

export const MigrationConnectStep = () => {
	const {
		needsMetaMask,
		isOnPolygonNetwork,
		account,
		chainId,
		chainId2Debug,
		chainIdDebug,
		connectWallet,
		connecting,
		supportsMetaMask,
	} = useMetaMask();
	const history = useHistory();
	const { openExternal } = useLink();

	const { t } = useTranslation();

	const profile = useActiveProfile();

	const wallets = useMemo(
		() =>
			profile
				.wallets()
				.findByCoinWithNetwork("ARK", "ark.mainnet")
				// Only wallets with a balance greater than the transaction fee +0.05 ARK
				.filter((wallet) => wallet.balance() >= TRANSACTION_FEE + 0.05),
		[profile],
	);

	const [selectedAddress, setSelectedAddress] = useState<string>();

	const selectedWallet = useMemo(() => {
		if (!selectedAddress) {
			return;
		}

		return profile.wallets().findByAddressWithNetwork(selectedAddress, "ark.mainnet");
	}, [selectedAddress, profile]);

	const walletBalance = useMemo(() => {
		if (!selectedWallet) {
			return 0;
		}

		return Math.round(selectedWallet.balance() * 100) / 100;
	}, [selectedWallet]);

	const amountYouGet = useMemo(() => {
		if (!selectedWallet) {
			return 0;
		}

		const amount = selectedWallet.balance() - TRANSACTION_FEE;

		return Math.round(amount * 100) / 100;
	}, [selectedWallet]);

	const accountIsInWrongNetwork = useMemo(() => {
		if (!account || needsMetaMask) {
			return false;
		}

		return !isOnPolygonNetwork;
	}, [account, isOnPolygonNetwork, needsMetaMask]);

	const polygonFieldIsDisabled = useMemo(
		() => needsMetaMask || !account || !isOnPolygonNetwork,
		[needsMetaMask, account, isOnPolygonNetwork],
	);

	const addressSelectedHandler = (address: string) => {
		setSelectedAddress(address);
	};

	const stepIsValid = useMemo(
		() => !!account && !accountIsInWrongNetwork && !!selectedWallet,
		[account, accountIsInWrongNetwork, selectedWallet],
	);

	const cancelHandler = useCallback(() => {
		const path = generatePath(ProfilePaths.Migration, { profileId: profile.id() });
		history.push(path);
	}, [profile, history]);

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.DESCRIPTION")}
			onCancel={cancelHandler}
			onContinue={() => {}}
			isValid={stepIsValid}
		>
			<ul>
				<li>chain id: {chainId}</li>
				<li>chain id from window.ethereum: {chainIdDebug}</li>
				<li>chain id from provider: {chainId2Debug}</li>
			</ul>
			<div className="space-y-3">
				<div className="rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
					<FormField name="address">
						<FormLabel label={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.ARK_ADDRESS")} />

						<SelectAddress
							wallets={wallets}
							profile={profile}
							disabled={wallets.length === 0}
							placeholder={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE")}
							title={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE")}
							showWalletName={false}
							description={t(
								"MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE_DESCRIPTION",
							)}
							onChange={addressSelectedHandler}
						/>
					</FormField>

					<div className="mt-4 flex justify-between">
						<div className="space-y-2">
							<div className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_SEND")}
							</div>
							<div className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
								<Amount ticker="ARK" value={walletBalance} />
							</div>
						</div>
						<div className="space-y-2 text-right">
							<div className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("TRANSACTION.TRANSACTION_FEE")}
							</div>
							<div className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
								<Amount ticker="ARK" value={TRANSACTION_FEE * -1} showSign isNegative />
							</div>
						</div>
					</div>
				</div>

				<div
					className={cn("relative overflow-hidden rounded-xl bg-theme-secondary-100 p-5 dark:bg-black", {
						"dark:border-2 dark:border-theme-danger-400 ": accountIsInWrongNetwork,
					})}
				>
					<div className="relative">
						<FormField name="polygonAddress">
							<FormLabel
								label={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.POLYGON_MIGRATION_ADDRESS")}
							/>
							{polygonFieldIsDisabled ? (
								<div
									data-testid="MigrationStep__polygon-disabled"
									className="flex h-14 w-full items-center rounded border border-theme-secondary-200 bg-theme-background px-4 dark:border-theme-secondary-700"
								>
									<div className="h-8 w-8 rounded-full border border-theme-secondary-200 bg-theme-secondary-200 ring-theme-background dark:border-theme-secondary-700 dark:bg-theme-secondary-700" />
								</div>
							) : (
								<SelectPolygonAddress value={account!} />
							)}
						</FormField>

						<div className="mt-4 space-y-2">
							<div className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_GET")}
							</div>
							<div className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
								<Amount ticker="ARK" value={amountYouGet} />
							</div>
						</div>
					</div>

					{accountIsInWrongNetwork && (
						<div
							data-testid="MigrationStep__wrongnetwork"
							className="absolute inset-0 flex flex-col items-center justify-center space-y-3 rounded-xl bg-theme-danger-50/80 px-4 py-3 backdrop-blur-[3px] dark:bg-black/70"
						>
							<div>
								<Icon name="StatusError" className="text-theme-danger-400" size="lg" />
							</div>

							<div className="max-w-[27rem] text-center text-sm font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
								<Trans
									i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_POLYGON"
									components={{
										linkMigrationGuide: <Link to={MIGRATION_GUIDE_URL} isExternal />,
									}}
								/>
							</div>
						</div>
					)}

					{polygonFieldIsDisabled && !accountIsInWrongNetwork && (
						<div className="bg-theme-secondary-100/70 dark:bg-theme-secondary-900/70 absolute inset-0 flex items-center justify-center px-4 py-3 backdrop-blur-[3px]">
							<div className="flex max-w-[24rem] flex-col items-center space-y-4 text-center font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
								<div className="text-sm">
									<PolygonFieldMessage
										needsMetaMask={needsMetaMask}
										supportsMetaMask={supportsMetaMask}
									/>
								</div>

								{connecting ? (
									<div
										data-testid="MigrationStep__connecting"
										className="flex items-center space-x-2 pt-3"
									>
										<Spinner size="sm" theme="system" width={3} />

										<span className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
											{t("COMMON.CONNECTING")}
										</span>
									</div>
								) : (
									<>
										{needsMetaMask ? (
											<MetaMaskButton
												className="w-full sm:w-auto"
												onClick={() => openExternal("https://metamask.io/download/")}
											>
												{supportsMetaMask
													? t(
															"MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.INSTALL_METAMASK",
													  )
													: t(
															"MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.DOWNLOAD_METAMASK",
													  )}
											</MetaMaskButton>
										) : (
											<MetaMaskButton className="w-full sm:w-auto" onClick={connectWallet}>
												{t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.CONNECT_WALLET")}
											</MetaMaskButton>
										)}
									</>
								)}
							</div>
						</div>
					)}
				</div>
			</div>
		</MigrationStep>
	);
};
