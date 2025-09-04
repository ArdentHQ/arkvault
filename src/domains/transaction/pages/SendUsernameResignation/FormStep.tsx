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

interface FormStepProperties {
	senderWallet?: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
	onWalletChange: (wallet: ProfilesContracts.IReadWriteWallet) => void;
	hideHeader?: boolean;
}

export const FormStep = ({ senderWallet, profile, onWalletChange, hideHeader = false }: FormStepProperties) => {
	const { t } = useTranslation();

	const { activeNetwork: network } = useActiveNetwork({ profile });

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
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.TITLE")}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="SendTransactionLight"
							darkIcon="SendTransactionDark"
							dimIcon="SendTransactionDim"
						/>
					}
					subtitle={t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.DESCRIPTION")}
				/>
			)}

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
						wallets={profile.wallets().values()}
						profile={profile}
						disabled={profile.wallets().count() === 0}
						onChange={handleSelectSender}
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendUsernameResignation()}
					/>
				</FormField>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3 sm:space-y-0">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.METHOD")}</DetailTitle>
							<div className="bg-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded px-1 py-[3px] dark:border dark:bg-transparent">
								<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-[12px] leading-[15px] font-semibold">
									{t("TRANSACTION.TRANSACTION_TYPES.RESIGN_USERNAME")}
								</span>
							</div>
						</div>

						<div className="hidden sm:block">
							<Divider
								dashed
								className="border-theme-secondary-300 dark:border-theme-secondary-800 dim:border-theme-dim-700 h-px"
							/>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.USERNAME")}</DetailTitle>
							<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
								{senderWallet && senderWallet.username()}
							</div>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
