import React, { useMemo, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import MigrationStep from "domains/migration/components/MigrationStep";
import SelectPolygonAddress from "../SelectPolygonAddress";
import { FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveProfile } from "@/app/hooks";
import { Amount } from "@/app/components/Amount";
import { Link } from "@/app/components/Link";

// @TODO: Move this to an env variable
const TRANSACTION_FEE = 0.05;
// @TBD
const MIGRATION_GUIDE_URL = "https://arkvault.io/docs";
// @TBD
const METAMASK_URL = "https://metamask.io/";

const MetamaskButton = ({ children }: { children: React.ReactNode }) => (
	<button
		type="button"
		className="flex space-x-2 rounded-lg bg-gradient-to-r from-[#FFDB80] via-[#F27C0B] to-[#4381C0] bg-size-200 bg-pos-0 py-[14px] px-5 transition-all duration-100 ease-in-out hover:bg-pos-100"
	>
		<span>{/* Metamask logo */}</span>
		<span className="font-semibold text-white">{children}</span>
	</button>
);

const PolygonFieldMessage = ({ needsPolygonNetwork }: { needsPolygonNetwork: boolean }) => {
	if (needsPolygonNetwork) {
		return (
			<Trans
				i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_POLYGON"
				components={{
					linkMetamask: <Link to={METAMASK_URL} isExternal />,
				}}
			/>
		);
	}

	return (
		<Trans
			i18nKey="MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.METAMASK.MESSAGES.NEEDS_METAMASK"
			components={{
				linkMigrationGuide: <Link to={MIGRATION_GUIDE_URL} isExternal />,
			}}
		/>
	);
};

export const MigrationConnectStep = () => {
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

	// @TODO
	const needsMetamask = useMemo(() => true, []);
	// @TODO
	const needsPolygonNetwork = useMemo(() => false, []);

	const polygonFieldIsDisabled = useMemo(
		() => needsMetamask || needsPolygonNetwork,
		[needsMetamask, needsPolygonNetwork],
	);

	const addressSelectedHandler = (address: string) => {
		setSelectedAddress(address);
	};

	return (
		<MigrationStep
			title={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.TITLE")}
			description={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.DESCRIPTION")}
			onCancel={() => {}}
			onContinue={() => {}}
			isValid={false}
		>
			<div className="space-y-3">
				<div className="rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
					<FormField name="address">
						<FormLabel label={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.ARK_ADDRESS")} />

						<SelectAddress
							wallets={wallets}
							profile={profile}
							disabled={wallets.length === 0}
							placeholder={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.SELECT_WALLET_TO_MIGRATE")}
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
								<Amount ticker="ARK" value={-TRANSACTION_FEE} showSign />
							</div>
						</div>
					</div>
				</div>

				<div className="relative overflow-hidden rounded-xl bg-theme-secondary-100 p-5 dark:bg-black">
					<div className="relative">
						<FormField name="polygonAddress">
							<FormLabel
								label={t("MIGRATION.MIGRATION_ADD.STEP_CONNECT.FORM.POLYGON_MIGRATION_ADDRESS")}
							/>
							<SelectPolygonAddress disabled={polygonFieldIsDisabled} />
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
					{polygonFieldIsDisabled && (
						<div className="bg-theme-secondary-100/70 dark:bg-theme-secondary-900/70 absolute inset-0 flex items-center justify-center backdrop-blur-sm">
							<div className="flex max-w-[24rem] flex-col items-center space-y-4 text-center font-semibold text-theme-secondary-700 dark:text-theme-secondary-500">
								<div className="text-sm">
									<PolygonFieldMessage needsPolygonNetwork={needsPolygonNetwork} />
								</div>
								<MetamaskButton>Connect Wallet</MetamaskButton>
							</div>
						</div>
					)}
				</div>
			</div>
		</MigrationStep>
	);
};
