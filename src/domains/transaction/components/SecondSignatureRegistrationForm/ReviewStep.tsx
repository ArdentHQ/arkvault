import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { FormField } from "@/app/components/Form";
import { DetailLabel, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { ThemeIcon } from "@/app/components/Icon";

export const ReviewStep = ({
	wallet,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();
	const { watch, getValues, unregister } = useFormContext();

	const [defaultFee] = useState(() => watch("fee"));
	const fee = getValues("fee") ?? defaultFee;

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="SecondSignatureRegistrationForm__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon
						dimensions={[24, 24]}
						lightIcon="SendTransactionLight"
						darkIcon="SendTransactionDark"
					/>
				}
			/>

			<div className="-mx-3 mt-6 space-y-3 sm:mx-0 sm:mt-4 sm:space-y-4">
				<FormField name="senderAddress">
					<TransactionAddresses
						senderAddress={wallet.address()}
						network={wallet.network()}
						recipients={[]}
						profile={profile}
					/>
				</FormField>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="flex w-full items-center justify-between sm:justify-start">
						<DetailTitle className="w-auto sm:min-w-24">{t("COMMON.CATEGORY")}</DetailTitle>
						<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dark:border dark:border-theme-secondary-800 dark:bg-transparent">
							<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dark:text-theme-secondary-500">
								{t("TRANSACTION.TRANSACTION_TYPES.SECOND_SIGNATURE")}
							</span>
						</div>
					</div>
				</DetailWrapper>

				<div data-testid="DetailWrapper">
					<DetailLabel>{t("COMMON.TRANSACTION_SUMMARY")}</DetailLabel>
					<div className="mt-0 p-3 sm:mt-2 sm:p-0">
						<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
					</div>
				</div>
			</div>
		</section>
	);
};
