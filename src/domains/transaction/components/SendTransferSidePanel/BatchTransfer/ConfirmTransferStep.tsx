import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { useActiveProfile, useValidation } from "@/app/hooks";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import { Amount } from "@/app/components/Amount";
import { ExchangeCurrencyAmount } from "@/domains/transaction/components/SendTransferSidePanel/SendTransferSidepanel.blocks";
import { FormField, FormLabel } from "@/app/components/Form";
import { FeeField } from "@/domains/transaction/components/FeeField";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { TransactionSteps } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTranfer.blocks";
import { useBatchTransferDetails } from "@/domains/transaction/hooks/use-batch-transfer-details";
import { Divider } from "@/app/components/Divider";
import { Button } from "@/app/components/Button";
import { RecipientsModal } from "@/domains/transaction/components/RecipientsModal";
import cn from "classnames";

interface ConfirmTransferStepProperties {
	wallet: Contracts.IReadWriteWallet;
	ledgerIsAwaitingDevice?: boolean;
	ledgerIsAwaitingApp?: boolean;
	isAwaitingLedgerAction?: boolean;
	onDeviceNotAvailable: () => void;
}

export const ConfirmTransferStep = ({
	wallet,
	ledgerIsAwaitingDevice,
	ledgerIsAwaitingApp,
	isAwaitingLedgerAction,
	onDeviceNotAvailable,
}: ConfirmTransferStepProperties) => {
	const { t } = useTranslation();

	const isFeeDisabled = wallet.isLedger() && isAwaitingLedgerAction;
	const showAuthenticationStep = wallet.isLedger() ? isAwaitingLedgerAction : true;

	const [showModal, setShowModal] = useState(false);

	const { register, getValues } = useFormContext();
	const { recipients, tokenContractAddress } = getValues();

	const profile = useActiveProfile();

	const { amount, convertedAmount, walletToken, exchangeTicker } = useBatchTransferDetails({
		profile,
		recipients,
		tokenContractAddress,
		wallet,
	});

	const ticker = walletToken.token().displaySymbol();

	const { common: commonValidation } = useValidation();

	const nativeTokenBalance = wallet.balance();

	useEffect(() => {
		register("gasPrice", commonValidation.gasPrice(nativeTokenBalance, getValues, wallet.network()));
		register("gasLimit", commonValidation.gasLimit(nativeTokenBalance, getValues, wallet.network()));
	}, [commonValidation, register, nativeTokenBalance.toString()]);

	const network = profile.activeNetwork();

	return (
		<section data-testid="BatchTransfer__confirm-transfer-step">
			<div className="-mx-3 space-y-3 sm:mx-0 sm:space-y-4">
				<DetailWrapper label={t("COMMON.DETAILS")} className="rounded-xl">
					<div className="space-y-3">
						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-44 sm:pr-6">{t("COMMON.TOKEN")}</DetailTitle>

							<div className="whitespace-normal break-all text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
								{walletToken.token().name()}
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-44 sm:pr-6">{t("COMMON.RECIPIENTS")}</DetailTitle>

							<div className="whitespace-normal break-all text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
								<div className="flex items-center">
									<span className="inline-flex items-center gap-1 text-sm font-semibold leading-[17px] sm:text-base sm:leading-5">
										{recipients.length}
									</span>

									<div className="h-5 leading-5">
										<Divider type="vertical" size="md" />
									</div>

									<Button
										onClick={() => setShowModal(true)}
										variant="transparent"
										data-testid="TransactionRecipientsModal--ShowList"
										className="p-0 text-sm leading-[17px] text-theme-navy-600 underline decoration-theme-navy-600 decoration-dashed decoration-1 underline-offset-4 sm:text-base sm:leading-5"
									>
										{t("TRANSACTION.VIEW_RECIPIENTS_LIST")}
									</Button>
								</div>
							</div>
						</div>

						<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
							<DetailTitle className="w-auto sm:min-w-44 sm:pr-6">{t("COMMON.AMOUNT")}</DetailTitle>

							<div className="flex flex-1 flex-row items-center justify-end gap-2 sm:w-full sm:justify-start">
								<Amount
									ticker={ticker}
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
					</div>
				</DetailWrapper>

				<div className="mx-0">
					<TransactionSteps approvalStatus="approved" transferStatus="active" />
				</div>

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
							type="batchTransfer"
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
							onDeviceNotAvailable={onDeviceNotAvailable}
						/>
					</div>
				)}
			</div>
			<RecipientsModal
				isOpen={showModal}
				onClose={() => setShowModal(false)}
				recipients={recipients}
				ticker={ticker}
			/>
		</section>
	);
};
