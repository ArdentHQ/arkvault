import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { Amount } from "@/app/components/Amount";
import { Tooltip } from "@/app/components/Tooltip";
import { useValidatorRegistrationLockedFee } from "./hooks/useValidatorRegistrationLockedFee";
import { Alert } from "@/app/components/Alert";
import { BigNumber } from "@/app/lib/helpers";
import cn from "classnames";

export const ReviewStep = ({
	wallet,
	profile,
	hideHeader = false,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
	hideHeader?: boolean;
}) => {
	const { t } = useTranslation();

	const { getValues, unregister, errors, trigger } = useFormContext();

	const { validatorPublicKey } = getValues();

	const feeTransactionData = useMemo(() => ({ validatorPublicKey }), [validatorPublicKey]);

	const {
		validatorRegistrationFee,
		validatorRegistrationFeeAsFiat,
		validatorRegistrationFeeTicker,
		validatorRegistrationFeeAsFiatTicker,
	} = useValidatorRegistrationLockedFee({
		profile,
		wallet,
	});

	const gasPrice = BigNumber.make(getValues("gasPrice") ?? 0);
	const gasLimit = BigNumber.make(getValues("gasLimit") ?? 0);

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	useEffect(() => {
		trigger("lockedFee");
	}, [gasPrice, gasLimit]);

	return (
		<section data-testid="ValidatorRegistrationForm__review-step">
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.REVIEW_STEP.TITLE")}
					subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="SendTransactionLight"
							darkIcon="SendTransactionDark"
							dimIcon="SendTransactionDim"
						/>
					}
				/>
			)}

			{errors.lockedFee && <Alert className={cn({ "mt-4": !hideHeader })}>{errors.lockedFee.message}</Alert>}

			<div
				className={cn("space-y-3 -mx-3 sm:mx-0 sm:space-y-4", {
					"mt-6 sm:mt-4": !hideHeader,
				})}
			>
				<TransactionAddresses
					labelClassName="w-auto sm:min-w-36"
					senderAddress={wallet.address()}
					recipients={[]}
					profile={profile}
					network={wallet.network()}
				/>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-40">{t("COMMON.METHOD")}</DetailTitle>
							<div className="bg-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded px-1 py-[3px] dark:border dark:bg-transparent">
								<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-[12px] leading-[15px] font-semibold">
									{wallet.isValidator()
										? t("TRANSACTION.TRANSACTION_TYPES.UPDATE_VALIDATOR")
										: t("TRANSACTION.TRANSACTION_TYPES.REGISTER_VALIDATOR")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-40">
								{t("TRANSACTION.VALIDATOR_PUBLIC_KEY")}
							</DetailTitle>
							<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
								{validatorPublicKey}
							</div>
						</div>
					</div>
				</DetailWrapper>

				{!wallet?.isValidator() && (
					<div className="space-y-3 sm:space-y-2">
						<DetailWrapper label={t("COMMON.TRANSACTION_SUMMARY")} className="rounded-xl">
								<div className="flex flex-col gap-3">
									<div className="flex items-center justify-between gap-4 space-x-2 sm:justify-start sm:space-x-0">
										<DetailTitle className="w-auto sm:min-w-40">
											{t("COMMON.LOCKED_AMOUNT")}
										</DetailTitle>

										<div className="flex flex-row items-center gap-2">
											<Amount
												ticker={validatorRegistrationFeeTicker}
												value={validatorRegistrationFee}
												className="font-semibold"
											/>

											{validatorRegistrationFeeAsFiat !== null && (
												<div className="text-theme-secondary-700 font-semibold">
													(~
													<Amount
														ticker={validatorRegistrationFeeAsFiatTicker}
														value={validatorRegistrationFeeAsFiat}
													/>
													)
												</div>
											)}

											<Tooltip content={t("TRANSACTION.REVIEW_STEP.AMOUNT_LOCKED_TOOLTIP")}>
												<div className="bg-theme-primary-100 dark:bg-theme-dark-800 dark:text-theme-dark-50 dim:bg-theme-dim-800 dim:text-theme-dim-50 text-theme-primary-600 flex h-5 w-5 items-center justify-center rounded-full">
													<Icon name="QuestionMarkSmall" size="sm" />
												</div>
											</Tooltip>
										</div>
									</div>
								</div>
							</DetailWrapper>
					</div>
				)}
				<div data-testid="DetailWrapper">
					<div className="px-3 sm:px-0 border-t border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 pt-6 sm:pt-0 sm:border-none">
						<FormField name="fee">
							<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
							<FeeField
								type={wallet.isValidator() ? "updateValidator" : "validatorRegistration"}
								data={feeTransactionData}
								network={wallet.network()}
								profile={profile}
							/>
						</FormField>
					</div>
				</div>
			</div>
		</section>
	);
};
