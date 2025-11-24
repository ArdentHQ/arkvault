import { Contracts as ProfilesContracts } from "@/app/lib/profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField } from "@/app/components/Form";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { SelectAddress } from "@/domains/profile/components/SelectAddress";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { WalletCapabilities } from "@/domains/portfolio/lib/wallet.capabilities";
import { Tooltip } from "@/app/components/Tooltip";
import { Amount } from "@/app/components/Amount";
import { useValidatorResignationLockedFee } from "./hooks/useValidatorResignationLockedFee";
import { BigNumber } from "@/app/lib/helpers";

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
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.TITLE")}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="SendTransactionLight"
							darkIcon="SendTransactionDark"
							dimIcon="SendTransactionDim"
						/>
					}
					subtitle={t("TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.DESCRIPTION")}
				/>
			)}

			<Alert>{t("TRANSACTION.PAGE_VALIDATOR_RESIGNATION.FORM_STEP.WARNING")}</Alert>

			<div className="space-y-3 sm:space-y-4">
				<FormField name="senderAddress">
					<SelectAddress
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
						disableAction={(wallet) => !WalletCapabilities(wallet).canSendValidatorResignation()}
						variant="modern"
					/>
				</FormField>

				<DetailWrapper label={t("COMMON.ACTION")}>
					<div className="flex flex-col gap-3">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[162px]">{t("COMMON.METHOD")}</DetailTitle>
							<div className="bg-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded px-1 py-[3px] dark:border dark:bg-transparent">
								<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-[12px] leading-[15px] font-semibold">
									{t("TRANSACTION.TRANSACTION_TYPES.RESIGN_VALIDATOR")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[162px]">
								{t("TRANSACTION.VALIDATOR_PUBLIC_KEY")}
							</DetailTitle>
							<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
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
								<div className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-sm font-semibold md:text-base">
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
								<div className="bg-theme-primary-100 dark:bg-theme-dark-800 dark:text-theme-dark-50 dim:bg-theme-dim-800 dim:text-theme-dim-50 text-theme-primary-600 flex h-5 w-5 items-center justify-center rounded-full">
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
