import { DTO } from "@/app/lib/profiles";
import React, { JSX, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { FormStep } from "@/domains/transaction/components/SendTransferSidePanel/FormStep";
import { TransferLedgerReview } from "@/domains/transaction/components/SendTransferSidePanel/LedgerReview";
import { ReviewStep } from "@/domains/transaction/components/SendTransferSidePanel/ReviewStep";
import { SendTransferStep } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.contracts";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { useSelectedTokenContractAddress } from "@/domains/transaction/hooks/use-selected-token-contract-address";
import { useUnconfirmedTransactions } from "@/domains/transaction/hooks/use-unconfirmed-transactions";
import { Form } from "@/app/components/Form";
import { QRModal } from "@/app/components/QRModal";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useKeyup } from "@/app/hooks/use-keyup";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransaction } from "@/domains/transaction/hooks";
import { useTransactionQueryParameters } from "@/domains/transaction/hooks/use-transaction-query-parameters";
import { assertNetwork, assertWallet } from "@/utils/assertions";
import { toasts } from "@/app/services";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import {
	TransferFormData,
	TransferOverwriteModal,
} from "@/domains/transaction/components/SendTransferSidePanel/TransferOverwriteModal";
import {
	handleQRCodeReadError,
	isSendTransferNextDisabled,
	parseQRCodeUrl,
} from "@/domains/transaction/components/SendTransferSidePanel/utils";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { ConfirmSendTransaction } from "@/domains/transaction/components/ConfirmSendTransaction";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { useSelectsTransactionSender } from "@/domains/transaction/hooks/use-selects-transaction-sender";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { BatchTransferTabs } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs";
import { BatchTransferTabStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";
import { useSendTransferStepConfig } from "@/domains/transaction/hooks/use-send-transfer-header-config";
import { useBatchTransferStepConfig } from "@/domains/transaction/hooks/use-batch-transfer-header-config";
import { useConnectLedger } from "@/domains/transaction/hooks/use-connect-ledger";

const MAX_TABS = 5;

export const SendTransferSidePanel = ({
	open,
	onOpenChange,
	isTokenTransfer,
	tokenContractAddress,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	tokenContractAddress?: string;
	isTokenTransfer?: boolean;
}): JSX.Element => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();

	const [mounted, setMounted] = useState(false);
	const { activeWallet: wallet, setActiveWallet: setWallet } = useSelectsTransactionSender({
		active: mounted,
	});

	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const tokens = wallet?.tokens().values() ?? [];

	const selectedTokenContract = useSelectedTokenContractAddress({
		defaultTicker: activeNetwork.ticker(),
		enabled: open,
		tokenContractAddress,
	});

	const { fetchWalletUnconfirmedTransactions } = useTransaction();
	const { hasDeviceAvailable, isConnected } = useLedgerContext();
	const { addUnconfirmedTransactionFromSigned } = useUnconfirmedTransactions();

	const { hasReset: shouldResetForm, queryParameters: deepLinkParameters } = useTransactionQueryParameters();

	const abortReference = useRef(new AbortController());

	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const firstTabIndex = SendTransferStep.FormStep;
	const [activeTab, setActiveTab] = useState<SendTransferStep>(firstTabIndex);

	const [unconfirmedTransactions, setUnconfirmedTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);

	const { buildSearchParametersError, validateSearchParameters } = useSearchParametersValidation();

	const {
		form,
		resetForm,
		submitForm,
		handleSubmit,
		getValues,
		lastEstimatedExpiration,
		formState: { isDirty, isValid, isSubmitting, dirtyFields },
	} = useSendTransferForm({ tokenContractAddress: selectedTokenContract, tokens, wallet });

	const [batchTransferActiveTab, setBatchTransferActiveTab] = useState<BatchTransferTabStep>(
		BatchTransferTabStep.ReviewStep,
	);

	const [isApproveTransactionConfirmed, setIsApproveTransactionConfirmed] = useState(false);

	const { recipients, tokenContractAddress: contractAddress } = getValues();
	const isBatchTransfer = contractAddress && contractAddress !== "ARK" && recipients?.length > 1;

	const isInBatchTransferFlow = isBatchTransfer && activeTab === SendTransferStep.ReviewStep;

	useKeyup("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isInBatchTransferFlow || isButton || isNextDisabled || activeTab >= SendTransferStep.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const { connectLedger } = useConnectLedger({
		canConnect: !!wallet,
		onReady: () => void handleSubmit(() => submit(true))(),
		profile: activeProfile,
	});

	useEffect(() => {
		if (activeProfile.wallets().count() === 1 && !wallet) {
			const wallet = activeProfile.wallets().values()[0];
			setWallet(wallet);
		}
	}, [activeProfile, wallet]);

	const resetState = useCallback(() => {
		setActiveTab(firstTabIndex);
		setBatchTransferActiveTab(BatchTransferTabStep.ReviewStep);

		resetForm(() => {
			setErrorMessage(undefined);
			setUnconfirmedTransactions([]);
			setTransaction(undefined);
			setWallet(undefined);
		});
	}, [resetForm, firstTabIndex]);

	const navigate = useNavigate();

	const onMountChange = useCallback(
		(mounted: boolean) => {
			setMounted(mounted);
			if (!mounted) {
				resetState();
			}
		},
		[resetState, navigate],
	);

	useEffect(() => {
		if (!shouldResetForm || !open) {
			return;
		}

		setActiveTab(firstTabIndex);

		const resetValues = window.setTimeout(() => resetState());

		return () => {
			window.clearTimeout(resetValues);
		};
	}, [firstTabIndex, shouldResetForm, open, resetState]);

	const [showOverwriteModal, setShowOverwriteModal] = useState(false);
	const [overwriteData, setOverwriteData] = useState<TransferFormData>({} as TransferFormData);

	const [showQRModal, setShowQRModal] = useState(false);

	const submit = useCallback(
		async (skipUnconfirmedCheck = false) => {
			assertWallet(wallet);

			if (!skipUnconfirmedCheck) {
				const unconfirmed = await fetchWalletUnconfirmedTransactions(wallet);
				setUnconfirmedTransactions(unconfirmed);

				if (unconfirmed.length > 0) {
					setIsConfirmModalOpen(true);
					return;
				}
			}

			try {
				const transaction = await submitForm(abortReference);

				addUnconfirmedTransactionFromSigned(transaction);

				setTransaction(transaction);
				setActiveTab(SendTransferStep.SummaryStep);
			} catch (error: any) {
				setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
				setActiveTab(SendTransferStep.ErrorStep);
			}
		},
		[fetchWalletUnconfirmedTransactions, submitForm, wallet, addUnconfirmedTransactionFromSigned],
	);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === SendTransferStep.ErrorStep) {
			setActiveTab(SendTransferStep.FormStep);
			return;
		}

		if (activeTab === firstTabIndex) {
			form.setValue("tokenContractAddress", undefined);
			onOpenChange(false);
			return;
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async () => {
		abortReference.current = new AbortController();

		const { network, senderAddress } = getValues();
		assertNetwork(network);
		const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());

		const nextStep = activeTab + 1;

		const isLedgerTransaction = nextStep === SendTransferStep.AuthenticationStep && senderWallet?.isLedger();

		if (isLedgerTransaction && !isLedgerTransportSupported()) {
			setErrorMessage(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"));
			setActiveTab(SendTransferStep.ErrorStep);
			return;
		}

		setActiveTab(nextStep);

		if (isLedgerTransaction) {
			await connectLedger();
		}
	};

	const hideStepNavigation =
		activeTab === SendTransferStep.ErrorStep ||
		(activeTab === SendTransferStep.AuthenticationStep && wallet?.isLedger());

	const isNextDisabled = useMemo<boolean>(() => {
		const network = getValues("network");

		return isSendTransferNextDisabled({
			activeTab,
			isDirty,
			isValid,
			network,
		});
	}, [activeTab, getValues, isDirty, isValid]);

	const currentFormData: TransferFormData = {
		amount: form.getValues("amount"),
		memo: form.getValues("memo"),
		recipientAddress: form.getValues("recipientAddress"),
	};

	const handleQRCodeRead = async (url: string) => {
		setShowQRModal(false);

		const { network } = getValues();

		let qrData: URLSearchParams | undefined;

		try {
			qrData = parseQRCodeUrl(url, network);
		} catch {
			handleQRCodeReadError(t);
			return;
		}

		const result = await validateSearchParameters(activeProfile, env, qrData, {
			nethash: network?.meta().nethash,
			network: network?.id(),
		});

		if (result?.error) {
			toasts.error(buildSearchParametersError(result.error, true));
			return;
		}

		const formHasValues = Object.values(currentFormData).some(Boolean);

		let newValues = {} as any;

		for (const [qrKey, formKey] of Object.entries({
			amount: "amount",
			memo: "memo",
			recipient: "recipientAddress",
		})) {
			const value = (qrData as URLSearchParams).get(qrKey);

			if (!value) {
				continue;
			}

			if (formHasValues) {
				newValues = { ...newValues, [formKey]: value };
			} else {
				form.setValue(formKey as any, value, { shouldDirty: true, shouldValidate: true });
			}
		}

		if (Object.keys(newValues).length > 0) {
			setOverwriteData(newValues);
			setShowOverwriteModal(true);
		}

		toasts.success(t("TRANSACTION.QR_CODE_SUCCESS"));
	};

	const { isConfirmed, transaction: confirmedTransaction } = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: wallet,
	});

	const sendTransferStepConfig = useSendTransferStepConfig({
		activeTab,
		isConfirmed,
		wallet,
	});

	const batchTransferStepConfig = useBatchTransferStepConfig({
		activeTab: batchTransferActiveTab,
		isConfirmed: isApproveTransactionConfirmed,
		wallet,
	});

	const config = isInBatchTransferFlow ? batchTransferStepConfig : sendTransferStepConfig;

	const preventAccidentalClosing = useMemo(
		() => dirtyFields.amount || dirtyFields.recipientAddress || activeTab !== SendTransferStep.FormStep,
		[dirtyFields.amount, dirtyFields.recipientAddress, activeTab],
	);

	const isLastStep = activeTab === SendTransferStep.SummaryStep;
	const isLedgerAuthenticationStep =
		!!wallet && wallet.isLedger() && activeTab === SendTransferStep.AuthenticationStep;

	return (
		<SidePanel
			open={open}
			minimizeable={!isLastStep}
			onOpenChange={onOpenChange}
			onMountChange={onMountChange}
			title={config.getTitle()}
			subtitle={config.getSubtitle()}
			titleIcon={config.getTitleIcon()}
			dataTestId="SendTransferSidePanel"
			hasSteps
			totalSteps={MAX_TABS - 1}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={isLastStep}
			disableOutsidePress={preventAccidentalClosing}
			disableEscapeKey={preventAccidentalClosing}
			shakeWhenClosing={preventAccidentalClosing}
			footer={
				<SidePanelButtons
					hidden={
						isLedgerAuthenticationStep || (isBatchTransfer && activeTab === SendTransferStep.ReviewStep)
					}
				>
					{!isLastStep && (
						<Button
							data-testid="SendTransfer__back-button"
							variant="secondary"
							onClick={handleBack}
							disabled={isSubmitting}
						>
							{t("COMMON.BACK")}
						</Button>
					)}

					{activeTab < SendTransferStep.AuthenticationStep && (
						<Button
							data-testid="SendTransfer__continue-button"
							onClick={handleNext}
							disabled={isNextDisabled || isSubmitting}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					)}

					{activeTab === SendTransferStep.AuthenticationStep && (
						<Button
							data-testid="SendTransfer__send-button"
							onClick={() => {
								void handleSubmit(() => submit())();
							}}
							disabled={isSubmitting || !isValid}
							isLoading={isSubmitting}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{activeTab === SendTransferStep.SummaryStep && (
						<Button data-testid="SendTransfer__close-button" onClick={() => onOpenChange(false)}>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			<Form context={form}>
				<Tabs activeId={activeTab}>
					<StepsProvider steps={MAX_TABS - 1} activeStep={activeTab}>
						<TabPanel tabId={SendTransferStep.FormStep}>
							<FormStep
								tokens={tokens}
								isTokenTransfer={isTokenTransfer}
								network={activeNetwork}
								senderWallet={wallet}
								profile={activeProfile}
								deeplinkProps={deepLinkParameters}
								onScan={() => setShowQRModal(true)}
								onChange={({ sender }) => {
									setWallet(sender);
								}}
							/>
						</TabPanel>

						<TabPanel tabId={SendTransferStep.ReviewStep}>
							{!isBatchTransfer && <ReviewStep wallet={wallet!} network={activeNetwork} />}
							{isBatchTransfer && (
								<BatchTransferTabs
									wallet={wallet!}
									activeTab={batchTransferActiveTab}
									setActiveTab={setBatchTransferActiveTab}
									onApproveConfirmed={() => {
										setIsApproveTransactionConfirmed(true);
									}}
									onError={(error) => {
										setErrorMessage(error);
										setActiveTab(SendTransferStep.ErrorStep);
									}}
									onBack={() => {
										setActiveTab(SendTransferStep.FormStep);
										setBatchTransferActiveTab(BatchTransferTabStep.ReviewStep);
									}}
									onSubmit={() => {
										void handleSubmit(() => submit())();
									}}
								/>
							)}
						</TabPanel>

						<TabPanel tabId={SendTransferStep.AuthenticationStep}>
							<AuthenticationStep
								wallet={wallet!}
								ledgerDetails={
									<TransferLedgerReview
										wallet={wallet!}
										estimatedExpiration={lastEstimatedExpiration}
										profile={activeProfile}
									/>
								}
								ledgerIsAwaitingDevice={!hasDeviceAvailable}
								ledgerIsAwaitingApp={!isConnected}
								onDeviceNotAvailable={() => {
									// keep waiting when it is not available
								}}
								noHeading
							/>
						</TabPanel>

						<TabPanel tabId={SendTransferStep.SummaryStep}>
							<TransactionSuccessful
								transaction={confirmedTransaction || transaction!}
								senderWallet={wallet!}
								noHeading
								skipConfirmationCheck
							/>
						</TabPanel>

						<TabPanel tabId={SendTransferStep.ErrorStep}>
							<ErrorStep errorMessage={errorMessage} withCopyErrorButton hideFooter />
						</TabPanel>

						{!hideStepNavigation && (
							<div className="mt-2">
								<button className="sr-only" type="submit" onClick={(e) => e.preventDefault()} />
							</div>
						)}
					</StepsProvider>
				</Tabs>

				<TransferOverwriteModal
					isOpen={showOverwriteModal}
					onCancel={() => setShowOverwriteModal(false)}
					onConfirm={(clearPrefilled: boolean) => {
						if (clearPrefilled) {
							for (const key of ["recipientAddress", "amount", "memo"]) {
								form.setValue(key as any, undefined, { shouldDirty: true, shouldValidate: true });
							}
						}

						for (const [key, value] of Object.entries(overwriteData)) {
							form.setValue(key as any, value as any, { shouldDirty: true, shouldValidate: true });
						}

						setShowOverwriteModal(false);
					}}
					currentData={currentFormData}
					newData={overwriteData}
				/>

				<ConfirmSendTransaction
					profile={activeProfile}
					unconfirmedTransactions={unconfirmedTransactions}
					isOpen={isConfirmModalOpen}
					onConfirm={() => {
						setIsConfirmModalOpen(false);
						handleSubmit(() => submit(true))();
					}}
					onClose={() => {
						setIsConfirmModalOpen(false);
					}}
				/>
			</Form>

			{createPortal(
				<QRModal
					isOpen={showQRModal}
					onCancel={() => setShowQRModal(false)}
					onRead={(text: string) => handleQRCodeRead(text)}
				/>,
				document.body,
			)}
		</SidePanel>
	);
};
