import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { Divider } from "@/app/components/Divider";
import { Button } from "@/app/components/Button";
import { TruncateEnd } from "@/app/components/TruncateEnd";

export const ReviewStep = ({
	wallet,
	profile,
}: {
	wallet: Contracts.IReadWriteWallet;
	profile: Contracts.IProfile;
}) => {
	const { t } = useTranslation();

	const { getValues, unregister } = useFormContext();
	const { bytecode } = getValues();

	const [showFullBytecode, setShowFullByteCode] = useState(false);

	const feeTransactionData = useMemo(() => ({ bytecode }), [bytecode]);

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="ContractDeploymentForm__review-step">
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
									{t("TRANSACTION.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.BYTECODE")}</DetailTitle>
							<div className="flex items-center">
								<div className="no-ligatures truncate text-sm font-semibold leading-[17px] text-theme-secondary-900 dim:text-theme-dim-50 dark:text-theme-secondary-200 sm:text-base sm:leading-5">
									<TruncateEnd text={bytecode} maxChars={12} showTooltip={false} />
								</div>
								<div className="h-5 leading-[17px] sm:leading-5">
									<Divider type="vertical" size="md" />
								</div>

								<Button
									onClick={() => setShowFullByteCode(!showFullBytecode)}
									variant="transparent"
									data-testid="ContractDeploymentForm--ShowFullByteCode"
									className="p-0 text-sm leading-[17px] text-theme-navy-600 underline decoration-theme-navy-600 decoration-dashed decoration-1 underline-offset-4 sm:text-base sm:leading-5"
								>
									{showFullBytecode ? t("COMMON.HIDE") : t("TRANSACTION.VIEW_FULL")}
								</Button>
							</div>
						</div>
					</div>
					<div
						className={cn(
							"max-h-0 overflow-y-scroll border-t border-theme-secondary-300 text-sm leading-5 opacity-0 transition-all dim:border-theme-dim-700 dark:border-theme-dark-700 sm:text-base sm:leading-7",
							{
								"-mb-3 mt-3 max-h-64 pt-3 opacity-100 sm:-mx-6 sm:-mb-1 sm:mt-5 sm:px-6 sm:pt-4":
									showFullBytecode,
							},
						)}
					>
						{bytecode}
					</div>
				</DetailWrapper>

				<div className="border-t border-theme-secondary-300 px-3 pt-6 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:border-none sm:px-0 sm:pt-0">
					<FormField name="fee">
						<FormLabel
							textClassName="text-sm leading-[17px] sm:text-base sm:leading-5"
							label={t("TRANSACTION.TRANSACTION_FEE")}
						/>
						<FeeField
							type="contractDeployment"
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
