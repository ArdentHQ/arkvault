import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { Amount } from "@/app/components/Amount";
import { Tooltip } from "@/app/components/Tooltip";
import { useValidatorRegistrationLockedFee } from "./hooks/useValidatorRegistrationLockedFee";
import { Alert } from "@/app/components/Alert";
import { BigNumber } from "@/app/lib/helpers";

export const ReviewStep = ({
	wallet,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
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
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
			/>

			{errors.lockedFee && <Alert className="mt-4">{errors.lockedFee.message}</Alert>}

			<div className="-mx-3 mt-6 space-y-3 sm:mx-0 sm:mt-4 sm:space-y-4">
				<TransactionAddresses
					labelClassName="w-auto sm:min-w-36"
					senderAddress={wallet.address()}
					recipients={[]}
					profile={profile}
					network={wallet.network()}
				/>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3 sm:space-y-0">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-40">{t("COMMON.CATEGORY")}</DetailTitle>
							<div className="bg-theme-secondary-200 dark:border-theme-secondary-800 flex items-center rounded px-1 py-[3px] dark:border dark:bg-transparent">
								<span className="text-theme-secondary-700 dark:text-theme-secondary-500 text-[12px] leading-[15px] font-semibold">
									{wallet.isValidator()
										? t("TRANSACTION.TRANSACTION_TYPES.UPDATE_VALIDATOR")
										: t("TRANSACTION.TRANSACTION_TYPES.VALIDATOR_REGISTRATION")}
								</span>
							</div>
						</div>

						<div className="hidden sm:block">
							<Divider
								dashed
								className="border-theme-secondary-300 dark:border-theme-secondary-800 h-px"
							/>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-40">
								{t("TRANSACTION.VALIDATOR_PUBLIC_KEY")}
							</DetailTitle>
							<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
								{validatorPublicKey}
							</div>
						</div>
					</div>
				</DetailWrapper>

				{!wallet?.isValidator() && (
					<div className="space-y-3 sm:space-y-2">
						<div className="mx-3 sm:mx-0">
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
												<div className="bg-theme-primary-100 dark:bg-theme-dark-800 dark:text-theme-dark-50 text-theme-primary-600 flex h-5 w-5 items-center justify-center rounded-full">
													<Icon name="QuestionMarkSmall" size="sm" />
												</div>
											</Tooltip>
										</div>
									</div>
								</div>
							</DetailWrapper>
						</div>
					</div>
				)}
				<div data-testid="DetailWrapper">
					<div className="mt-0 p-3 sm:p-0">
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
