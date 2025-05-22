import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { FormField } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import { ThemeIcon } from "@/app/components/Icon";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";

interface FormStepProperties {
	senderWallet?: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
	onWalletChange: (wallet: ProfilesContracts.IReadWriteWallet) => void;
}

export const FormStep = ({ senderWallet, profile, onWalletChange }: FormStepProperties) => {
	const { t } = useTranslation();

	const { activeNetwork: network } = useActiveNetwork({ profile });
	const { allWallets } = usePortfolio({ profile });

	const handleSelectSender = (address: any) => {
		const newSenderWallet = profile.wallets().findByAddressWithNetwork(address, network.id());
		const isFullyRestoredAndSynced =
			newSenderWallet?.hasBeenFullyRestored() && newSenderWallet.hasSyncedWithNetwork();

		if (!isFullyRestoredAndSynced) {
			newSenderWallet?.synchroniser().identity();
		}

		if (newSenderWallet) {
			onWalletChange(newSenderWallet);
		}
	};

	return (
		<section data-testid="SendUsernameResignation__form-step" className="space-y-6 sm:space-y-4">
			<StepHeader
				title={t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.TITLE")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
				subtitle={t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.DESCRIPTION")}
			/>

			<div className="space-y-3 sm:space-y-4">
				<FormField name="senderAddress">
					<SelectAddress
						showWalletAvatar={false}
						wallet={
							senderWallet
								? {
										address: senderWallet.address(),
										network: senderWallet.network(),
									}
								: undefined
						}
						wallets={allWallets}
						profile={profile}
						disabled={allWallets.length === 0}
						onChange={handleSelectSender}
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendUsernameResignation()}
					/>
				</FormField>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3 sm:space-y-0">
						<div className="flex gap-4 justify-between items-center w-full sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.CATEGORY")}</DetailTitle>
							<div className="flex items-center px-1 rounded dark:bg-transparent dark:border bg-theme-secondary-200 py-[3px] dark:border-theme-secondary-800">
								<span className="font-semibold text-theme-secondary-700 text-[12px] leading-[15px] dark:text-theme-secondary-500">
									{t("TRANSACTION.TRANSACTION_TYPES.USERNAME_RESIGNATION")}
								</span>
							</div>
						</div>

						<div className="hidden sm:block">
							<Divider
								dashed
								className="h-px border-theme-secondary-300 dark:border-theme-secondary-800"
							/>
						</div>

						<div className="flex gap-4 justify-between items-center w-full sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.USERNAME")}</DetailTitle>
							<div className="text-sm font-semibold sm:text-base sm:leading-5 no-ligatures text-theme-secondary-900 truncate leading-[17px] dark:text-theme-secondary-200">
								{senderWallet && senderWallet.username()}
							</div>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
