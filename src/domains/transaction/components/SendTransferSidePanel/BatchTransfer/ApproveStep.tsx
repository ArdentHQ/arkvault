import { Contracts } from "@/app/lib/profiles";
import React, { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useActiveProfile, useValidation } from "@/app/hooks";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount } from "@/app/components/Amount";
import { ExchangeCurrencyAmount } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidepanel.blocks";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { TruncatedContractAddress } from "@/domains/transaction/components/ContractAddressHint/ContractAddressHint";
import { useBatchTransferDetails } from "@/domains/transaction/hooks/use-batch-transfer-details";
import cn from "classnames";

interface ApproveStepProperties {
	wallet: Contracts.IReadWriteWallet;
	ledgerIsAwaitingDevice?: boolean;
	isAwaitingLedgerAction?: boolean;
	ledgerIsAwaitingApp?: boolean;
}

export const ApproveStep = ({
	wallet,
	ledgerIsAwaitingDevice,
	ledgerIsAwaitingApp,
	isAwaitingLedgerAction,
}: ApproveStepProperties) => {
	const { t } = useTranslation();

	const isFeeDisabled = wallet.isLedger() && isAwaitingLedgerAction;
	const showAuthenticationStep = wallet.isLedger() ? isAwaitingLedgerAction : true;

	const { register, getValues } = useFormContext();
	const { recipients, tokenContractAddress } = getValues();

	const profile = useActiveProfile();

	const { amount, convertedAmount, walletToken, exchangeTicker } = useBatchTransferDetails({
		profile,
		recipients,
		tokenContractAddress,
		wallet,
	});

	const { common: commonValidation } = useValidation();

	const nativeTokenBalance = wallet.balance();

	useEffect(() => {
		register("gasPrice", commonValidation.gasPrice(nativeTokenBalance, getValues, wallet.network()));
		register("gasLimit", commonValidation.gasLimit(nativeTokenBalance, getValues, wallet.network()));
	}, [commonValidation, register, nativeTokenBalance.toString()]);

	const network = profile.activeNetwork();

	return (
		<section data-testid="BatchTransfer__approve-step">
			<div className="space-y-3 sm:space-y-4">
				<DetailWrapper label={t("COMMON.AUTHORIZATION_DETAILS")} className="rounded-xl">
					<div className="space-y-3">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-40 sm:pr-6">{t("COMMON.TOKEN")}</DetailTitle>

							<div className="whitespace-normal break-all text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
								{walletToken.token().name()}
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-40 sm:pr-6">
								{t("TRANSACTION.BATCH_TRANSFER.APPROVAL_AMOUNT")}
							</DetailTitle>

							<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
								<Amount
									ticker={walletToken.token().displaySymbol()}
									value={amount}
									decimals={walletToken.token().decimals()}
									className="whitespace-normal break-all text-sm font-semibold md:text-base"
								/>
								<ExchangeCurrencyAmount
									isTestnet={wallet.network().isTest()}
									convertedAmount={convertedAmount}
									exchangeTicker={exchangeTicker}
								/>
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-40 sm:pr-6">{t("COMMON.CONTRACT")}</DetailTitle>

							<div className="whitespace-normal break-all text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
								<TruncatedContractAddress
									token={walletToken}
									link={wallet.link().wallet(walletToken.token().address())}
								/>
							</div>
						</div>

						<div className="-mb-3 mt-3 rounded bg-theme-secondary-100 px-4 py-2 dim:bg-theme-dim-950 dark:bg-theme-dark-950 sm:-mx-6 sm:-mb-5 sm:rounded-b-xl sm:px-6">
							<div className="flex items-center gap-2 text-theme-secondary-700 dim:text-theme-dim-100 dark:text-theme-dark-100">
								<p className="leading-4.25 sm:leading-5.25 text-sm font-semibold">
									{t("TRANSACTION.BATCH_TRANSFER.APPROVE_CONTRACT_STEP.DETAILS_HINT")}
								</p>
							</div>
						</div>
					</div>
				</DetailWrapper>

				<div
					className={cn(
						"mt-6 border-t border-theme-secondary-300 px-3 pt-6 dim:border-theme-dim-700 dark:border-theme-dark-700 sm:mt-0 sm:border-none sm:px-0 sm:pt-0",
						{
							"blur-xs pointer-events-none mb-0": isFeeDisabled,
						},
					)}
				>
					<FormField name="fee" disableStateHints>
						<FormLabel
							textClassName="hidden sm:block sm:text-base leading-5"
							label={t("TRANSACTION.TRANSACTION_FEE")}
						/>

						<FormLabel textClassName="sm:hidden text-sm leading-[17px]" label={t("COMMON.FEE")} />

						<FeeField
							type="approve"
							isDisabled={isFeeDisabled}
							data={{ token: walletToken.token() }}
							network={network}
							profile={profile}
						/>
					</FormField>
				</div>

				{showAuthenticationStep && (
					<div className="px-3 sm:px-0">
						<AuthenticationStep
							wallet={wallet!}
							noHeading
							noDescription
							subject="message"
							ledgerIsAwaitingDevice={ledgerIsAwaitingDevice}
							ledgerIsAwaitingApp={ledgerIsAwaitingApp}
							onDeviceNotAvailable={() => {
								// keep waiting when it is not available
							}}
						/>
					</div>
				)}
			</div>
		</section>
	);
};
