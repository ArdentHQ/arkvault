import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField } from "@/app/components/Form";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Icon } from "@/app/components/Icon";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { Tooltip } from "@/app/components/Tooltip";
import { Amount } from "@/app/components/Amount";
import { useValidatorResignationLockedFee } from "./hooks/useValidatorResignationLockedFee";
import { BigNumber } from "@/app/lib/helpers";
import { SelectAddressDropdown } from "@/domains/profile/components/SelectAddressDropdown";

interface FormStepProperties {
	senderWallet?: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
	onWalletChange: (wallet: ProfilesContracts.IReadWriteWallet) => void;
}

export const FormStep = ({ senderWallet, profile, onWalletChange }: FormStepProperties) => {
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

	const {
		validatoResigationFee,
		validatoResigationFeeAsFiat,
		validatoResigationFeeTicker,
		validatoResigationFeeAsFiatTicker,
	} = useValidatorResignationLockedFee({
		profile,
		wallet: senderWallet,
	});

	return (
		<section data-testid="SendValidatorResignation__form-step" className="space-y-6 sm:space-y-4">
			<Alert>{t("TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.WARNING")}</Alert>

			<div className="space-y-3 sm:space-y-4">
				<FormField name="senderAddress">
					<SelectAddressDropdown
						disabled={profile.wallets().count() === 0}
						profile={profile}
						onChange={(wallet) => {
							handleSelectSender(wallet?.address() ?? "");
						}}
						wallets={profile.wallets().values()}
						wallet={senderWallet}
						defaultNetwork={profile.activeNetwork()}
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendValidatorResignation()}
						showBalance
					/>
				</FormField>

				<DetailWrapper label={t("COMMON.ACTION")}>
					<div className="flex flex-col gap-3">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[162px]">{t("COMMON.METHOD")}</DetailTitle>
							<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dim:border-theme-dim-700 dark:border dark:border-theme-secondary-800 dark:bg-transparent">
								<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
									{t("TRANSACTION.TRANSACTION_TYPES.RESIGN_VALIDATOR")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[162px]">
								{t("TRANSACTION.VALIDATOR_PUBLIC_KEY")}
							</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{senderWallet && senderWallet.validatorPublicKey()}
							</div>
						</div>
					</div>
				</DetailWrapper>

				<DetailWrapper label={t("TRANSACTION.SUMMARY")}>
					<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-[162px]">{t("COMMON.UNLOCKED_AMOUNT")}</DetailTitle>

						<div className="flex flex-row items-center gap-2">
							<Amount
								ticker={validatoResigationFeeTicker}
								value={validatoResigationFee}
								className="text-sm font-semibold md:text-base"
							/>

							{validatoResigationFeeAsFiat !== null && (
								<div className="text-sm font-semibold text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500 md:text-base">
									(~
									<Amount
										ticker={validatoResigationFeeAsFiatTicker}
										value={validatoResigationFeeAsFiat}
									/>
									)
								</div>
							)}

							<Tooltip
								content={
									BigNumber.make(validatoResigationFee).isZero()
										? t("TRANSACTION.VALIDATOR_REGISTERED_WITHOUT_FEE")
										: t("TRANSACTION.REVIEW_STEP.AMOUNT_UNLOCKED_TOOLTIP")
								}
								className="max-w-[418px]"
							>
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-primary-100 text-theme-primary-600 dim:bg-theme-dim-800 dim:text-theme-dim-50 dark:bg-theme-dark-800 dark:text-theme-dark-50">
									<Icon name="QuestionMarkSmall" size="sm" />
								</div>
							</Tooltip>
						</div>
					</div>
				</DetailWrapper>
			</div>
		</section>
	);
};
