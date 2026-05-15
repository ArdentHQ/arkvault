import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { Icon } from "@/app/components/Icon";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { Amount } from "@/app/components/Amount";
import { Tooltip } from "@/app/components/Tooltip";
import { useValidatorResignationLockedFee } from "./hooks/useValidatorResignationLockedFee";
import { BigNumber } from "@/app/lib/helpers";

export const ReviewStep = ({
	senderWallet,
	profile,
}: {
	senderWallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();

	const { unregister } = useFormContext();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

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
		<section data-testid="SendValidatorResignation__review-step">
			<div className="-mx-3 mt-6 space-y-3 sm:mx-0 sm:mt-4 sm:space-y-4">
				<TransactionAddresses
					labelClassName="w-auto sm:min-w-[178px]"
					senderAddress={senderWallet.address()}
					network={senderWallet.network()}
					recipients={[]}
					profile={profile}
				/>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
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
								{senderWallet.validatorPublicKey()}
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
								className="max-w-[26.125rem]"
							>
								<div className="flex h-5 w-5 items-center justify-center rounded-full bg-theme-primary-100 text-theme-primary-600 dim:bg-theme-dim-800 dim:text-theme-dim-50 dark:bg-theme-dark-800 dark:text-theme-dark-50">
									<Icon name="QuestionMarkSmall" size="sm" />
								</div>
							</Tooltip>
						</div>
					</div>
				</DetailWrapper>

				<div className="border-t border-theme-secondary-300 px-3 pt-6 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:border-none sm:px-0 sm:pt-0">
					<FormField name="fee">
						<FormLabel textClassName="text-sm leading-[17px] sm:text-base sm:leading-5">
							{t("TRANSACTION.TRANSACTION_FEE")}
						</FormLabel>
						<FeeField
							type="validatorResignation"
							data={undefined}
							network={senderWallet.network()}
							profile={profile}
						/>
					</FormField>
				</div>
			</div>
		</section>
	);
};
