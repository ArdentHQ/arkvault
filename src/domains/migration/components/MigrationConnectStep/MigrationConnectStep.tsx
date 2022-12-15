import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import MigrationStep from "domains/migration/components/MigrationStep";
import { FormField, FormLabel } from "@/app/components/Form";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveProfile } from "@/app/hooks";
import { Amount } from "@/app/components/Amount";

// @TODO: Move this to an env variable
const TRANSACTION_FEE = 0.05;

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

		return selectedWallet.balance();
	}, [selectedWallet]);

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
			<div className="space-y-6 pt-6">
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
								-<Amount ticker="ARK" value={TRANSACTION_FEE} />
							</div>
						</div>
					</div>
				</div>
			</div>
		</MigrationStep>
	);
};
