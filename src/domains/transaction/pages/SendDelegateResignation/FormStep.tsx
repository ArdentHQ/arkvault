import { Contracts as ProfilesContracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";
import { ThemeIcon } from "@/app/components/Icon";

interface FormStepProperties {
	senderWallet: ProfilesContracts.IReadWriteWallet;
	profile: ProfilesContracts.IProfile;
}

export const FormStep = ({ senderWallet, profile }: FormStepProperties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="SendDelegateResignation__form-step" className="space-y-6 sm:space-y-4">
			<StepHeader
				title={t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.TITLE")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
					/>
				}
				subtitle={t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.DESCRIPTION")}
			/>

			<Alert>{t("TRANSACTION.PAGE_DELEGATE_RESIGNATION.FORM_STEP.WARNING")}</Alert>

			<div className="space-y-3 sm:space-y-4">
				<FormField name="senderAddress">
					<TransactionAddresses
						senderAddress={senderWallet.address()}
						network={senderWallet.network()}
						recipients={[]}
						profile={profile}
						labelClassName="w-auto sm:min-w-32"
					/>
				</FormField>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3 sm:space-y-0">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.CATEGORY")}</DetailTitle>
							<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dark:border dark:border-theme-secondary-800 dark:bg-transparent">
								<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dark:text-theme-secondary-500">
									{t("TRANSACTION.TRANSACTION_TYPES.DELEGATE_RESIGNATION")}
								</span>
							</div>
						</div>

						<div className="hidden sm:block">
							<Divider dashed />
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-28">{t("TRANSACTION.DELEGATE_NAME")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{senderWallet.username()}
							</div>
						</div>
					</div>
				</DetailWrapper>

				<FormField name="fee">
					<FormLabel>{t("TRANSACTION.TRANSACTION_FEE")}</FormLabel>
					<FeeField
						type="delegateResignation"
						data={undefined}
						network={senderWallet.network()}
						profile={profile}
					/>
				</FormField>
			</div>
		</section>
	);
};
