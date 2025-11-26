import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import cn from "classnames";
import { TransactionAddresses } from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { ThemeIcon } from "@/app/components/Icon";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { Divider } from "@/app/components/Divider";
import { Button } from "@/app/components/Button";
import { TruncateEnd } from "@/app/components/TruncateEnd";

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
	const { bytecode } = getValues();

	const [showFullBytecode, setShowFullByteCode] = useState(false);

	const feeTransactionData = useMemo(() => ({ bytecode }), [bytecode]);

	useEffect(() => {
		unregister("mnemonic");
	}, [unregister]);

	return (
		<section data-testid="ContractDeploymentForm__review-step">
			{!hideHeader && (
				<StepHeader
					title={t("TRANSACTION.REVIEW_STEP.TITLE")}
					subtitle={t("TRANSACTION.REVIEW_STEP.DESCRIPTION")}
					titleIcon={
						<ThemeIcon
							dimensions={[24, 24]}
							lightIcon="ReviewContractDeploymentLight"
							darkIcon="SendContractDeploymentDark"
							dimIcon="SendContractDeploymentDim"
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
									{t("TRANSACTION.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT")}
								</span>
							</div>
						</div>

						<div className="flex w-full items-center justify-between gap-4 sm:justify-start">
							<DetailTitle className="w-auto sm:min-w-[87px]">{t("COMMON.BYTECODE")}</DetailTitle>
							<div className="flex items-center">
								<div className="no-ligatures text-theme-secondary-900 dark:text-theme-secondary-200 dim:text-theme-dim-50 truncate text-sm leading-[17px] font-semibold sm:text-base sm:leading-5">
									<TruncateEnd text={bytecode} maxChars={12} />
								</div>
								<div className="h-5 leading-[17px] sm:leading-5">
									<Divider type="vertical" size="md" />
								</div>

								<Button
									onClick={() => setShowFullByteCode(!showFullBytecode)}
									variant="transparent"
									data-testid="ContractDeploymentForm--ShowFullByteCode"
									className="text-theme-navy-600 decoration-theme-navy-600 p-0 text-sm leading-[17px] underline decoration-dashed decoration-1 underline-offset-4 sm:text-base sm:leading-5"
								>
									{showFullBytecode ? t("COMMON.HIDE") : t("TRANSACTION.VIEW_FULL")}
								</Button>
							</div>
						</div>
					</div>
					<div
						className={cn(
							"border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 max-h-0 overflow-y-scroll border-t text-sm leading-5 opacity-0 transition-all sm:text-base sm:leading-7",
							{
								"mt-3 -mb-3 max-h-64 pt-3 opacity-100 sm:-mx-6 sm:mt-5 sm:-mb-1 sm:px-6 sm:pt-4":
									showFullBytecode,
							},
						)}
					>
						{bytecode}
					</div>
				</DetailWrapper>

				<div className="border-theme-secondary-300 dark:border-theme-dark-700 dim:border-theme-dim-700 border-t px-3 pt-6 sm:border-none sm:px-0 sm:pt-0">
					<FormField name="fee">
						<FormLabel label={t("TRANSACTION.TRANSACTION_FEE")} />
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
