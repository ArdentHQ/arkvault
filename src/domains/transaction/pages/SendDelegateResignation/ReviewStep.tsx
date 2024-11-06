import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Divider } from "@/app/components/Divider";

export const ReviewStep = ({
	senderWallet,
	profile,
}: {
	senderWallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();

	const { getValues, unregister } = useFormContext();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="SendDelegateResignation__review-step">
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

			<div className="-mx-3 space-y-3 sm:mx-0 sm:space-y-4">
				<TransactionAddresses
					labelClassName="w-auto sm:min-w-28"
					senderAddress={senderWallet.address()}
					network={senderWallet.network()}
					recipients={[]}
					profile={profile}
				/>

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

				<div className="mx-3 mt-2 sm:mx-0">
					<TotalAmountBox amount={0} fee={getValues("fee")} ticker={senderWallet.currency()} />
				</div>
			</div>
		</section>
	);
};
