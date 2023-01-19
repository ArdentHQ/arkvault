import React, { useEffect, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import cn from "classnames";
import { useFormContext } from "react-hook-form";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMetaMask } from "@/domains/migration/hooks/use-meta-mask";
import SelectPolygonAddress from "@/domains/migration/components/SelectPolygonAddress";
import { FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveProfile } from "@/app/hooks";
import { Amount } from "@/app/components/Amount";
import { Link } from "@/app/components/Link";
import { images } from "@/app/assets/images";
import { Header } from "@/app/components/Header";
import { useLink } from "@/app/hooks/use-link";
import { Icon } from "@/app/components/Icon";
import { Spinner } from "@/app/components/Spinner";
import {
	metamaskUrl,
	migrationGuideUrl,
	migrationMinBalance,
	migrationNetwork,
	migrationTransactionFee,
	migrationWalletAddress,
} from "@/utils/polygon-migration";
const { MetamaskLogo } = images.common;

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
					linkMigrationGuide: <Link to={migrationGuideUrl()} isExternal />,
				}}
			/>
		);
	}

	if (needsMetaMask) {
		return (
			<Trans
				i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_METAMASK"
				components={{
					linkMigrationGuide: <Link to={migrationGuideUrl()} isExternal />,
				}}
			/>
		);
	}

	return (
		<Trans
			i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_CONNECTED_WALLET"
			components={{
				linkMetamask: <Link to={metamaskUrl()} isExternal />,
			}}
		/>
	);
};

export const MigrationConnectStep = () => {
	const {
		needsMetaMask,
		isOnValidNetwork,
		account,
		connectWallet,
		connecting,
		supportsMetaMask,
		switching,
		switchToPolygonNetwork,
	} = useMetaMask();

	const { openExternal } = useLink();

	const form = useFormContext();
	const { setValue, watch } = form;

	const { fee, wallet } = watch();

	const { t } = useTranslation();

	const profile = useActiveProfile();

	const wallets = useMemo(
		() =>
			profile
				.wallets()
				.findByCoinWithNetwork("ARK", migrationNetwork())
				.filter((wallet) => wallet.balance() >= migrationMinBalance() + fee),
		[profile],
	);

	const migrationAmount = useMemo(() => {
		if (!wallet) {
			return 0;
		}

		return +(wallet.balance() - migrationTransactionFee()).toFixed(8);
	}, [wallet]);

	const accountIsInWrongNetwork = useMemo(() => {
		if (!account || needsMetaMask) {
			return false;
		}

		return !isOnValidNetwork;
	}, [account, isOnValidNetwork, needsMetaMask]);

	const polygonFieldIsDisabled = useMemo(
		() => needsMetaMask || !account || !isOnValidNetwork,
		[needsMetaMask, account, isOnValidNetwork],
	);

	const handleSelectAddress = (selectedAddress: string) => {
		let wallet: Contracts.IReadWriteWallet | undefined;

		if (selectedAddress) {
			wallet = profile.wallets().findByAddressWithNetwork(selectedAddress, migrationNetwork());
		}

		setValue("wallet", wallet, { shouldDirty: true, shouldValidate: true });
	};

	useEffect(() => {
		setValue(
			"recipients",
			[
				{
					address: migrationWalletAddress(),
					amount: migrationAmount,
				},
			],
			{
				shouldDirty: true,
				shouldValidate: true,
			},
		);
	}, [migrationAmount, setValue]);

	useEffect(() => {
		let migrationAddress: string | undefined;

		if (!!account && !accountIsInWrongNetwork) {
			migrationAddress = account;
		}

		setValue("migrationAddress", migrationAddress, { shouldDirty: true, shouldValidate: true });
	}, [account, accountIsInWrongNetwork, setValue]);

	return (
		<>
			<Header
				title={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}
				subtitle={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.DESCRIPTION")}
				className="mb-6"
				headerClassName="text-lg sm:text-2xl"
			/>

			<div className="-mx-5 space-y-3">
				<div className="rounded-xl bg-theme-secondary-100 p-5 dark:bg-black sm:px-5">
					<FormField name="address">
						<FormLabel label={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.ARK_ADDRESS")} />

						<SelectAddress
							wallet={{
								address: wallet?.address(),
								network: wallet?.network(),
							}}
							wallets={wallets}
							profile={profile}
							disabled={wallets.length === 0}
							placeholder={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE")}
							title={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE")}
							showWalletName={false}
							description={t(
								"MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE_DESCRIPTION",
							)}
							onChange={handleSelectAddress}
						/>
					</FormField>

					<div className="mt-4 flex justify-between">
						<div className="space-y-2">
							<div className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.AMOUNT_YOU_SEND")}
							</div>

							<div className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
								<Amount ticker="ARK" value={wallet?.balance() ?? 0} />
							</div>
						</div>

						<div className="space-y-2 text-right">
							<div className="text-sm font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
								{t("TRANSACTION.TRANSACTION_FEE")}
							</div>

							<div className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
								<Amount ticker="ARK" value={migrationTransactionFee() * -1} showSign isNegative />
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
									className="flex h-14 w-full items-center rounded border border-theme-secondary-400 px-5 dark:border-theme-secondary-700"
								>
									<div className="h-8 w-8 rounded-full border border-theme-secondary-400 ring-theme-background dark:border-theme-secondary-700" />
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
								<Amount ticker="ARK" value={migrationAmount} />
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
										linkMigrationGuide: <Link to={migrationGuideUrl()} isExternal />,
									}}
								/>

								<div className="mt-3 flex justify-center border-t border-theme-secondary-300 p-3 dark:border-theme-secondary-800">
									{switching ? (
										<div
											data-testid="MigrationStep__switching"
											className="flex items-center space-x-2"
										>
											<Spinner size="sm" theme="system" width={3} />

											<span className="font-semibold text-theme-secondary-900 dark:text-theme-secondary-200">
												{t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.SWITCHING_NETWORK")}
											</span>
										</div>
									) : (
										<button
											type="button"
											onClick={switchToPolygonNetwork}
											className="link flex items-center space-x-2"
											data-testid="MigrationStep__switchtopolygon"
										>
											<Icon name="Polygon" />

											<span>{t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.SWITCH_TO_POLYGON")}</span>
										</button>
									)}
								</div>
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
		</>
	);
};
