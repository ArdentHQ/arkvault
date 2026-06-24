import React, { useCallback, useState } from "react";
import { useFormContext } from "react-hook-form";

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
import {
	calculateTotalAmount
} from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTranfer.blocks";

export const BatchTransferTabs = ({
	onStepChange,
	onCancel,
	onSubmit,
	onBack,
	activeIndex,
	wallet,
}: BatchTransferTabsProperties) => {
	const { persist } = useEnvironmentContext();

	const { t } = useTranslation();
	const { formState, handleSubmit, getValues, register, unregister } = useFormContext();
	const { isValid, isSubmitting, isDirty } = formState;

	const [activeTab, setActiveTab] = useState<BatchTransferTabStep>(BatchTransferTabStep.ReviewStep);

	const isNextDisabled = false;

	useKeydown("Enter", (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#HDWalletTabs") !== null || target.tagName === "BODY";

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
				setActiveTab(BatchTransferTabStep.ApproveStep);
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
						signatory,
						data: {
							spender: wallet.address(),
							amount: calculateTotalAmount(recipients),
						},
						token,
					});

					const response = await wallet.transaction().broadcast(signedTransactionId);

					handleBroadcastError(response);

					await persist();

					const transactionData = wallet.transaction().transaction(signedTransactionId);

					console.log(transactionData);
					// setTransaction(transactionData);

					handleNext();
				} catch (error) {
					// setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
					// setActiveTab(Step.ErrorStep);
				}
			},
			[BatchTransferTabStep.SummaryStep]: async () => {},
		})[activeTab as Exclude<BatchTransferTabStep, BatchTransferTabStep.SummaryStep>]();

	const handleBack = useCallback(() => {
		if (onBack) {
			return onBack();
		}

		return onCancel?.();
	}, [activeTab, onBack, onCancel, onStepChange]);

	return (
		<>
			<div className="h-full pb-20">
				<Tabs id="ApproveContractTabs" activeId={activeTab}>
					<div data-testid="ApproveContractTabs--child" className="h-full">
						<div className="h-full">
							<TabPanel tabId={BatchTransferTabStep.ReviewStep}>
								<ReviewStep wallet={wallet} />
							</TabPanel>

							<TabPanel tabId={BatchTransferTabStep.ApproveStep}>
								<ApproveStep wallet={wallet} />
							</TabPanel>

							<TabPanel tabId={BatchTransferTabStep.SummaryStep}>tab summary</TabPanel>

							<TabPanel tabId={BatchTransferTabStep.ErrorStep}>tab error</TabPanel>
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
