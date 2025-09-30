import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { ThemeIcon } from "@/app/components/Icon";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import cn from "classnames";
export const ReviewStep = ({
	senderWallet,
	profile,
	hideHeader = false,
}: {
	senderWallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
	hideHeader?: boolean;
}) => {
	const { t } = useTranslation();

	const { unregister } = useFormContext();

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="SendUsernameResignation__review-step">
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
				className={cn("space-y-3 sm:mx-0 sm:space-y-4", {
					"mt-6 sm:mt-4": !hideHeader,
				})}
			>
				<TransactionAddresses
					labelClassName="w-auto sm:min-w-[87px]"
					senderAddress={senderWallet.address()}
					network={senderWallet.network()}
					recipients={[]}
					profile={profile}
				/>

				<DetailWrapper label={t("TRANSACTION.TRANSACTION_TYPE")}>
					<div className="flex flex-col gap-3">
						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.METHOD")}</DetailTitle>
							<div className="bg-theme-secondary-200 dark:border-theme-secondary-800 dim:border-theme-dim-700 flex items-center rounded px-1 py-[3px] dark:border dark:bg-transparent">
								<span className="text-theme-secondary-700 dark:text-theme-secondary-500 dim:text-theme-dim-200 text-[12px] leading-[15px] font-semibold">
									{t("TRANSACTION.TRANSACTION_TYPES.RESIGN_USERNAME")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.USERNAME")}</DetailTitle>
							<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
								{senderWallet.username()}
							</div>
						</div>
					</div>
				</DetailWrapper>

				<div className="mx-3 mt-2 sm:mx-0">
					<FormField name="fee">
						<FormLabel>{t("TRANSACTION.TRANSACTION_FEE")}</FormLabel>
						<FeeField
							type="usernameResignation"
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
