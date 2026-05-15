import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";

export const ReviewStep = ({
	wallet,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
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
			<div className="-mx-3 space-y-3 sm:mx-0 sm:space-y-4">
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
							<div className="flex items-center rounded bg-theme-secondary-200 px-1 py-[3px] dim:border-theme-dim-700 dark:border dark:border-theme-secondary-800 dark:bg-transparent">
								<span className="text-[12px] font-semibold leading-[15px] text-theme-secondary-700 dim:text-theme-dim-200 dark:text-theme-secondary-500">
									{t("TRANSACTION.TRANSACTION_TYPES.REGISTER_USERNAME")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.USERNAME")}</DetailTitle>
							<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
								{username}
							</div>
						</div>
					</div>
				</DetailWrapper>

				<div className="border-t border-theme-secondary-300 px-3 pt-6 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:border-none sm:px-0 sm:pt-0">
					<FormField name="fee">
						<FormLabel
							textClassName="text-sm leading-[17px] sm:text-base sm:leading-5"
							label={t("TRANSACTION.TRANSACTION_FEE")}
						/>
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
