import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { FormField } from "@/app/components/Form";
import { DetailDivider, DetailLabel, DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Address } from "@/app/components/Address";

export const ReviewStep = ({
	wallet,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();
	const { unregister, watch } = useFormContext();
	const { fee, participants, minParticipants } = watch();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="MultiSignature__review-step">
			<StepHeader
				title={t("TRANSACTION.REVIEW_STEP.TITLE")}
				subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
				titleIcon={
					<ThemeIcon dimensions={[24, 24]} lightIcon="SendTransactionLight" darkIcon="SendTransactionDark" />
				}
			/>

			<div className="space-y-4 pt-5">
				<FormField name="senderAddress">
					<TransactionAddresses
						senderAddress={wallet.address()}
						network={wallet.network()}
						recipients={[]}
						profile={profile}
						labelClassName="min-w-24"
					/>
				</FormField>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="space-y-3 sm:space-y-0" data-testid="MultisignatureDetail">
						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-24">{t("COMMON.CATEGORY")}</DetailTitle>
							<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dark:border dark:border-theme-secondary-800 dark:bg-transparent">
								<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dark:text-theme-secondary-500">
									{t("TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE")}
								</span>
							</div>
						</div>

						<DetailDivider />

						<div className="flex w-full items-center justify-between sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-24">{t("TRANSACTION.SIGNATURES")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{minParticipants}{" "}
								{t("TRANSACTION.MULTISIGNATURE.OUT_OF_LENGTH", { length: participants.length })}
							</div>
						</div>
					</div>
				</DetailWrapper>

				<div data-testid="DetailWrapper">
					<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
					<div className="mt-0 overflow-hidden rounded-lg border-theme-secondary-300 dark:border-theme-secondary-800 sm:mt-2 sm:border">
						<div className="hidden bg-theme-secondary-100 px-6 py-3 text-sm font-semibold leading-[17px] text-theme-secondary-700 sm:block">
							{t("TRANSACTION.ADDRESS")}
						</div>
						<div className="mb-2 mt-3 px-3 sm:px-6">
							{participants.map((participiant) => (
								<div
									key={participiant.address}
									className="mb-3 overflow-hidden rounded border border-theme-secondary-300 bg-theme-secondary-100 px-4 py-3 last:mb-0 sm:mb-0 sm:rounded-none sm:border-x-0 sm:border-t-0 sm:border-dashed sm:bg-transparent sm:px-0 sm:last:border-none"
								>
									<Address
										address={participiant.address}
										addressClass="text-theme-secondary-900 text-sm leading-[17px]"
										showCopyButton
									/>
								</div>
							))}
						</div>
					</div>
				</div>

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
