import React, { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";

import { DTO } from "@/app/lib/mainsail";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useKeydown } from "@/app/hooks/use-keydown";
import {
	BatchTransferTabsProperties,
	BatchTransferTabStep,
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
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";

const NAVIGATE_TO_CONFIRM_TRANSFER_DELAY_MS = 5000;

export const BatchTransferTabs = ({
	setActiveTab,
	onError,
	onSubmit,
	onBack,
	activeTab,
	wallet,
	onApproveConfirmed,
}: BatchTransferTabsProperties) => {
	const { persist } = useEnvironmentContext();

	const { formState, getValues } = useFormContext();
	const { isSubmitting, isValid } = formState;

	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);

	const { recipients, tokenContractAddress } = getValues();

	const totalAmount = calculateTotalAmount(recipients);

	const { isLoading: isAllowanceLoading, allowance } = useAllowance({
		enabled: activeTab === BatchTransferTabStep.ReviewStep,
		tokenAddress: tokenContractAddress,
		totalAmount: totalAmount.toFixed(0),
		wallet,
	});

	const {
		isConfirmed,
		isLoading: isRefreshingTransaction,
		transaction: confirmedTransaction,
	} = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: wallet,
	});

	useEffect(() => {
		if (isConfirmed) {
			onApproveConfirmed();
		}
	}, [isConfirmed, onApproveConfirmed]);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		if (activeTab === BatchTransferTabStep.SummaryStep && isConfirmed) {
			timeoutId = setTimeout(() => {
				void handleNext();
			}, NAVIGATE_TO_CONFIRM_TRANSFER_DELAY_MS);
		}

		return () => {
			clearTimeout(timeoutId);
		};
	}, [isConfirmed, activeTab]);

	const requiresContractApproval = !isAllowanceLoading && totalAmount.isGreaterThan(allowance);
	const isNextDisabled = !isValid || (isAllowanceLoading && activeTab === BatchTransferTabStep.ReviewStep);

	useKeydown("Enter", (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#BatchTransferTabs") !== null || target.tagName === "BODY";

		if (isComponentChild && !isNextDisabled && !isSubmitting) {
			void handleNext();
		}
	});

	const sendApprovalTransaction = async () => {
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
				data: {
					amount: calculateTotalAmount(recipients),
					spender: wallet.address(),
				},
				gasLimit,
				gasPrice,
				nonce: wallet.isLegacyCold() ? wallet.legacyNonce().toFixed(0) : undefined,
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
			onError(JSON.stringify({ message: error.message, type: error.name }));
		}
	};

	const handleNext = () =>
		({
			[BatchTransferTabStep.ReviewStep]: async () => {
				const nextStep = requiresContractApproval
					? BatchTransferTabStep.ApproveStep
					: BatchTransferTabStep.ConfirmTransferStep;
				setActiveTab(nextStep);
			},
			[BatchTransferTabStep.ApproveStep]: async () => {
				void sendApprovalTransaction();
			},
			[BatchTransferTabStep.SummaryStep]: async () => {
				setActiveTab(BatchTransferTabStep.ConfirmTransferStep);
			},
			[BatchTransferTabStep.ConfirmTransferStep]: async () => {
				onSubmit();
			},
		})[activeTab]();

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
									transaction={confirmedTransaction || transaction}
									senderWallet={wallet!}
									skipConfirmationCheck
									noHeading
									isRefreshingTransaction={isRefreshingTransaction}
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
						<Actions
							activeTab={activeTab}
							handleNext={handleNext}
							isNextDisabled={isNextDisabled}
							handleBack={handleBack}
							isConfirmed={isConfirmed}
						/>
					</SidePanelButtons>
				</div>
			</div>
		</>
	);
};

interface ActionsProperties {
	activeTab: BatchTransferTabStep;
	isConfirmed: boolean;
	handleNext: () => Promise<void>;
	handleBack: () => void;
	isNextDisabled: boolean;
}

const Actions = ({ activeTab, isConfirmed, handleBack, handleNext, isNextDisabled }: ActionsProperties) => {
	const { t } = useTranslation();

	if (activeTab === BatchTransferTabStep.SummaryStep && !isConfirmed) {
		return (
			<div className="leading-11 w-full text-center text-sm text-theme-secondary-700">
				Once confirmed, you'll be taken to the next step automatically.
			</div>
		);
	}

	return (
		<>
			{activeTab !== BatchTransferTabStep.SummaryStep && (
				<Button variant="secondary" onClick={handleBack} data-testid="BatchTranfer__back-button">
					{t("COMMON.BACK")}
				</Button>
			)}

			{activeTab === BatchTransferTabStep.SummaryStep && (
				<div className="leading-5.25 w-full text-sm text-theme-secondary-700">
					Continuing to transfer in 2s...
				</div>
			)}

			<Button onClick={handleNext} data-testid="BatchTranfer__continue-button" disabled={isNextDisabled}>
				{activeTab === BatchTransferTabStep.ReviewStep && t("COMMON.CONTINUE")}
				{activeTab === BatchTransferTabStep.ApproveStep && t("COMMON.APPROVE")}
				{activeTab === BatchTransferTabStep.SummaryStep && t("COMMON.CONTINUE_NOW")}
				{activeTab === BatchTransferTabStep.ConfirmTransferStep && t("COMMON.CONFIRM_TRANSACTION")}
			</Button>
		</>
	);
};
