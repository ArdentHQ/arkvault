import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailLabel, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";
import { Divider } from "@/app/components/Divider";
import { ThemeIcon } from "@/app/components/Icon";
import {TransactionAddresses} from "@/domains/transaction/components/TransactionDetail";

export const ReviewStep = ({ wallet, profile }: { wallet: Contracts.IReadWriteWallet; profile: Contracts.IProfile }) => {
	const { t } = useTranslation();

	const { getValues, unregister, watch } = useFormContext();
	const username = getValues("username");

	const [defaultFee] = useState(() => watch("fee"));
	const fee = getValues("fee") ?? defaultFee;

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="DelegateRegistrationForm__review-step" className="space-y-3 sm:space-y-4">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
			/>

			<TransactionAddresses labelClassName="w-auto sm:min-w-28" senderWallet={wallet} recipients={[]} profile={profile}/>

			<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
				<div className="space-y-3 sm:space-y-0">
					<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-28">{t("COMMON.CATEGORY")}</DetailTitle>
						<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dark:border dark:border-theme-secondary-800 dark:bg-transparent">
							<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dark:text-theme-secondary-500">
								{t("TRANSACTION.TRANSACTION_TYPES.DELEGATE_REGISTRATION")}
							</span>
						</div>
					</div>

					<div className="hidden sm:block">
						<Divider dashed />
					</div>

					<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-28">{t("TRANSACTION.DELEGATE_NAME")}</DetailTitle>
						<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
							{username}
						</div>
					</div>
				</div>
			</DetailWrapper>

			<div data-testid="DetailWrapper">
				<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
				<div className="mt-0 p-3 sm:mt-2 sm:p-0">
					<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
				</div>
			</div>
		</section>
	);
};
