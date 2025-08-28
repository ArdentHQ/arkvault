import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState, JSX } from "react";
import { useTranslation } from "react-i18next";
import { URLBuilder } from "@ardenthq/arkvault-url";
import { FormStep } from "@/domains/transaction/pages/SendTransfer/FormStep";
import { TransferLedgerReview } from "@/domains/transaction/pages/SendTransfer/LedgerReview";
import { ReviewStep } from "@/domains/transaction/pages/SendTransfer/ReviewStep";
import { SendTransferStep } from "@/domains/transaction/pages/SendTransfer/SendTransfer.contracts";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { QRModal } from "@/app/components/QRModal";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded } from "@/app/hooks";
import { useKeyup } from "@/app/hooks/use-keyup";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransaction } from "@/domains/transaction/hooks";
import { useTransactionQueryParameters } from "@/domains/transaction/hooks/use-transaction-query-parameters";
import { assertNetwork, assertWallet } from "@/utils/assertions";
import { useTransactionURL } from "@/domains/transaction/hooks/use-transaction-url";
import { toasts } from "@/app/services";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { isValidUrl } from "@/utils/url-validation";
import cn from "classnames";
import {
	TransferFormData,
	TransferOverwriteModal,
} from "@/domains/transaction/pages/SendTransfer/TransferOverwriteModal";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { ConfirmSendTransaction } from "@/domains/transaction/components/ConfirmSendTransaction";
import { ThemeIcon } from "@/app/components/Icon";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";

const MAX_TABS = 5;

export const SendTransferSidePanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}): JSX.Element => {
	const { t } = useTranslation();

	const { env } = useEnvironmentContext();
	const activeWallet = useActiveWalletWhenNeeded(false);
	const [wallet, setWallet] = useState<Contracts.IReadWriteWallet | undefined>(activeWallet);

	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const { fetchWalletUnconfirmedTransactions } = useTransaction();
	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();
	const { addPendingTransaction } = usePendingTransactions();

	const { hasReset: shouldResetForm, queryParameters: deepLinkParameters } = useTransactionQueryParameters();

	const abortReference = useRef(new AbortController());

	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const firstTabIndex = SendTransferStep.FormStep;
	const [activeTab, setActiveTab] = useState<SendTransferStep>(firstTabIndex);

	const [unconfirmedTransactions, setUnconfirmedTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);

	const { urlSearchParameters } = useTransactionURL();
	const { buildSearchParametersError, validateSearchParameters } = useSearchParametersValidation();

	const {
		form,
		resetForm,
		submitForm,
		handleSubmit,
		getValues,
		lastEstimatedExpiration,
		formState: { isDirty, isValid, isSubmitting },
	} = useSendTransferForm(wallet);

	useKeyup("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || isNextDisabled || activeTab >= SendTransferStep.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const connectLedger = useCallback(async () => {
		if (wallet) {
			await connect(activeProfile);
			void handleSubmit(() => submit(true))();
		}
	}, [wallet, activeProfile, connect]);

	useEffect(() => {
		if (activeProfile.wallets().count() === 1 && !wallet) {
			const wallet = activeProfile.wallets().values()[0];
			setWallet(wallet);
		}
	}, [activeProfile, wallet]);

	const resetState = useCallback(() => {
		setActiveTab(firstTabIndex);

		resetForm(() => {
			setErrorMessage(undefined);
			setUnconfirmedTransactions([]);
			setTransaction(undefined);
			setWallet(undefined);
		});
	}, [resetForm, firstTabIndex]);

	const onMountChange = useCallback(
		(mounted: boolean) => {
			if (!mounted) {
				resetState();
				return;
			}
		},
		[resetState],
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

				addPendingTransaction(transaction);

				setTransaction(transaction);
				setActiveTab(SendTransferStep.SummaryStep);
			} catch (error: any) {
				setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
				setActiveTab(SendTransferStep.ErrorStep);
			}
		},
		[fetchWalletUnconfirmedTransactions, submitForm, wallet, addPendingTransaction],
	);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === firstTabIndex) {
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

		if (nextStep === SendTransferStep.AuthenticationStep && senderWallet?.isLedger()) {
			if (!isLedgerTransportSupported()) {
				setErrorMessage(t("WALLETS.MODAL_LEDGER_WALLET.COMPATIBILITY_ERROR"));
				setActiveTab(SendTransferStep.ErrorStep);
				return;
			}
			await connectLedger();
		}

		setActiveTab(nextStep);
	};

	const hideStepNavigation =
		activeTab === SendTransferStep.ErrorStep ||
		(activeTab === SendTransferStep.AuthenticationStep && wallet?.isLedger());

	const isNextDisabled = useMemo<boolean>(() => {
		const network = getValues("network");

		if (activeTab === SendTransferStep.NetworkStep && typeof network?.isLive === "function") {
			return false;
		}

		if (!isDirty) {
			return true;
		}

		return !isValid;
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
			let uri = url;

			// If the url is not valid, we assume it's an ARK URI with address only,
			// and we need to convert it to a URL.
			if (!isValidUrl(url)) {
				const urlBuilder = new URLBuilder();

				urlBuilder.setNethash(network?.meta().nethash);
				uri = urlBuilder.generateTransfer(url);
			}

			qrData = urlSearchParameters(uri);
		} catch {
			if (!qrData) {
				toasts.error(t("TRANSACTION.VALIDATION.INVALID_QR_REASON", { reason: t("TRANSACTION.INVALID_URL") }));
				return;
			}
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

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: wallet,
	});

	const getTitle = () => {
		if (activeTab === SendTransferStep.ErrorStep) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === SendTransferStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === SendTransferStep.SummaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === SendTransferStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === SendTransferStep.AuthenticationStep && !wallet?.isLedger()) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
		}

		if (activeTab === SendTransferStep.FormStep) {
			return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION");
		}

		return;
	};

	const getTitleIcon = () => {
		if (activeTab === SendTransferStep.SummaryStep) {
			return (
				<ThemeIcon
					lightIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					darkIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimensions={[24, 24]}
					className={cn({
						"text-theme-primary-600": !isConfirmed,
						"text-theme-success-600": isConfirmed,
					})}
				/>
			);
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			if (wallet?.isLedger()) {
				return (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				);
			}

			return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
		}

		if (activeTab === SendTransferStep.ReviewStep) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		return (
			<ThemeIcon
				lightIcon="SendTransactionLight"
				darkIcon="SendTransactionDark"
				dimIcon="SendTransactionDim"
				dimensions={[24, 24]}
			/>
		);
	};

	return (
		<>
			<SidePanel
				open={open}
				onOpenChange={onOpenChange}
				onMountChange={onMountChange}
				title={getTitle()}
				subtitle={getSubtitle()}
				titleIcon={getTitleIcon()}
				dataTestId="SendTransferSidePanel"
				hasSteps
				totalSteps={MAX_TABS - 1}
				activeStep={activeTab}
				onBack={handleBack}
				isLastStep={activeTab === SendTransferStep.SummaryStep}
				disableOutsidePress
				disableEscapeKey={showQRModal || isConfirmModalOpen || showOverwriteModal}
				footer={
					<SidePanelButtons>
						{activeTab !== SendTransferStep.SummaryStep && (
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
								disabled={isSubmitting}
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
									network={activeNetwork}
									senderWallet={wallet}
									profile={activeProfile}
									deeplinkProps={deepLinkParameters}
									onScan={() => setShowQRModal(true)}
									onChange={({ sender }) => {
										setWallet(sender);
									}}
									hideHeader
								/>
							</TabPanel>

							<TabPanel tabId={SendTransferStep.ReviewStep}>
								<ReviewStep wallet={wallet!} network={activeNetwork} hideHeader />
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
										setErrorMessage(
											JSON.stringify({
												message: t("WALLETS.MODAL_LEDGER_WALLET.DEVICE_NOT_AVAILABLE"),
												type: "failed",
											}),
										);
										setActiveTab(SendTransferStep.ErrorStep);
									}}
									noHeading
								/>
							</TabPanel>

							<TabPanel tabId={SendTransferStep.SummaryStep}>
								<TransactionSuccessful transaction={transaction!} senderWallet={wallet!} noHeading />
							</TabPanel>

							<TabPanel tabId={SendTransferStep.ErrorStep}>
								<ErrorStep
									onClose={() => {
										assertWallet(wallet);
										onOpenChange(false);
									}}
									isBackDisabled={isSubmitting}
									onBack={() => {
										setActiveTab(SendTransferStep.FormStep);
									}}
									errorMessage={errorMessage}
									hideHeader
								/>
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
			</SidePanel>
			<QRModal
				isOpen={showQRModal}
				onCancel={() => setShowQRModal(false)}
				onRead={(text: string) => handleQRCodeRead(text)}
			/>
		</>
	);
};
