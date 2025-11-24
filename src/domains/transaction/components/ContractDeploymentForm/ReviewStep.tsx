import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { ThemeIcon } from "@/app/components/Icon";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";

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

	const { getValues, unregister } = useFormContext();
	const { username } = getValues();

	const feeTransactionData = useMemo(() => ({ username }), [username]);

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="UsernameRegistrationForm__review-step">
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

			<div
				className={cn("-mx-3 space-y-3 sm:mx-0 sm:space-y-4", {
					"mt-6 sm:mt-4": !hideHeader,
				})}
			>
				<TransactionAddresses
					labelClassName="w-auto sm:min-w-[103px] sm:pr-6"
					senderAddress={wallet.address()}
					recipients={[]}
					profile={profile}
					network={wallet.network()}
				/>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.METHOD")}</DetailTitle>
							<div className="bg-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded px-1 py-[3px] dark:border dark:bg-transparent">
								<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-[12px] leading-[15px] font-semibold">
									{t("TRANSACTION.TRANSACTION_TYPES.REGISTER_USERNAME")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.USERNAME")}</DetailTitle>
							<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
								{username}
							</div>
						</div>
					</div>
				</DetailWrapper>

				<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 border-t px-3 pt-6 sm:border-none sm:px-0 sm:pt-0">
					<FormField name="fee">
						<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
						<FeeField
							type="usernameRegistration"
							data={feeTransactionData}
							network={wallet.network()}
							profile={profile}
						/>
					</FormField>
				</div>
			</div>
		</section>
	);
};
