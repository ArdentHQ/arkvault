import React, { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { DTO } from "@/app/lib/mainsail";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useKeydown } from "@/app/hooks/use-keydown";
import {
	BatchTransferTabStep,
	BatchTransferTabsProperties,
} from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";
import { ReviewStep } from "./ReviewStep";
import { SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { useTranslation } from "react-i18next";
import { ApproveStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/ApproveStep";
import { httpClient } from "@/app/services";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { useEnvironmentContext } from "@/app/contexts";
import { calculateTotalAmount } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTranfer.blocks";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { ConfirmTransferStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/ConfirmTransferStep";
import { useAllowance } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/use-allowance";

export const BatchTransferTabs = ({
	setActiveTab,
	onCancel,
	onSubmit,
	onBack,
	activeTab,
	wallet,
}: BatchTransferTabsProperties) => {
	const { persist } = useEnvironmentContext();

	const { t } = useTranslation();
	const { formState, getValues } = useFormContext();
	const { isValid, isSubmitting, isDirty } = formState;

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);

	const { recipients, tokenContractAddress } = getValues();

	const { isLoading: isAllowanceLoading, allowance } = useAllowance({
		enabled: activeTab === BatchTransferTabStep.ReviewStep,
		tokenAddress: tokenContractAddress,
		wallet,
	});

	const totalAmount = calculateTotalAmount(recipients);
	const requiresContractApproval = !isAllowanceLoading && totalAmount.isGreaterThan(allowance);
	const isNextDisabled = isAllowanceLoading && activeTab === BatchTransferTabStep.ReviewStep;

	useKeydown("Enter", (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#BatchTransferTabs") !== null || target.tagName === "BODY";

		if (isComponentChild && !isNextDisabled && !isSubmitting) {
			if (activeTab < BatchTransferTabStep.SummaryStep) {
				handleNext();
			} else {
				// navigate
			}
		}
	});

	const handleNext = () =>
		({
			[BatchTransferTabStep.ReviewStep]: async () => {
				const nextStep = requiresContractApproval
					? BatchTransferTabStep.ApproveStep
					: BatchTransferTabStep.ConfirmTransferStep;
				setActiveTab(nextStep);
			},
			[BatchTransferTabStep.ApproveStep]: async () => {
				const {
					mnemonic,
					secondMnemonic,
					encryptionPassword,
					secret,
					secondSecret,
					gasLimit,
					gasPrice,
					recipients,
					tokenContractAddress,
				} = getValues();

				try {
					httpClient.forgetWalletCache(wallet);

					const signatory = await wallet.signatoryFactory().make({
						encryptionPassword,
						mnemonic,
						secondMnemonic,
						secondSecret,
						secret,
					});

					const token = wallet
						.tokens()
						.values()
						.find((token) => token.token().address() === tokenContractAddress) as WalletToken;

					const signedTransactionId = await wallet.transaction().signApproveContract({
						gasLimit,
						gasPrice,
						nonce: wallet.isLegacyCold() ? wallet.legacyNonce().toFixed(0) : undefined,
						data: {
							amount: calculateTotalAmount(recipients),
							spender: wallet.address(),
						},
						signatory,
						token,
					});

					const response = await wallet.transaction().broadcast(signedTransactionId);

					handleBroadcastError(response);

					await persist();

					const transactionData = wallet.transaction().transaction(signedTransactionId);

					setTransaction(transactionData);

					setActiveTab(BatchTransferTabStep.SummaryStep);
				} catch (error) {
					// setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
					// setActiveTab(Step.ErrorStep);
				}
			},
			[BatchTransferTabStep.SummaryStep]: async () => {
				setActiveTab(BatchTransferTabStep.ConfirmTransferStep);
			},
			[BatchTransferTabStep.ConfirmTransferStep]: async () => {
				onSubmit();
			},
		})[activeTab as Exclude<BatchTransferTabStep, BatchTransferTabStep.SummaryStep>]();

	const handleBack = useCallback(() => {
		if (activeTab === BatchTransferTabStep.ReviewStep || activeTab === BatchTransferTabStep.ConfirmTransferStep) {
			onBack?.();
			return;
		}

		setActiveTab(activeTab - 1);
	}, [activeTab, onBack, setActiveTab]);

	return (
		<>
			<div className="h-full pb-20">
				<Tabs id="BatchTransferTabs" activeId={activeTab}>
					<div data-testid="BatchTransferTabs--child" className="h-full">
						<div className="h-full">
							<TabPanel tabId={BatchTransferTabStep.ReviewStep}>
								<ReviewStep
									wallet={wallet}
									isLoading={isAllowanceLoading}
									requiresContractApproval={requiresContractApproval}
								/>
							</TabPanel>

							<TabPanel tabId={BatchTransferTabStep.ApproveStep}>
								<ApproveStep wallet={wallet} />
							</TabPanel>

							<TabPanel tabId={BatchTransferTabStep.SummaryStep}>
								<TransactionSuccessful
									transaction={transaction!}
									senderWallet={wallet!}
									skipConfirmationCheck={false}
									noHeading
								/>
							</TabPanel>

							<TabPanel tabId={BatchTransferTabStep.ConfirmTransferStep}>
								<ConfirmTransferStep wallet={wallet} />
							</TabPanel>
						</div>
					</div>
				</Tabs>
			</div>

			{/* Normal toolbar footer (no error) */}
			<div className="absolute bottom-0 left-0 right-0 flex w-full flex-col border-t border-theme-secondary-300 bg-theme-background px-6 py-4 dark:border-theme-dark-700">
				<div className="absolute bottom-0 left-0 right-0 flex w-full flex-col border-t border-theme-secondary-300 bg-theme-background px-6 py-4 dark:border-theme-dark-700">
					<SidePanelButtons>
						<Button variant="secondary" onClick={handleBack} data-testid="BatchTranfer__back-button">
							{t("COMMON.BACK")}
						</Button>

						<Button onClick={handleNext} data-testid="BatchTranfer__continue-button">
							{t("COMMON.CONTINUE")}
						</Button>
					</SidePanelButtons>
				</div>
			</div>
		</>
	);
};
