import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";

import { URLBuilder } from "@ardenthq/arkvault-url";
import { FormStep } from "./FormStep";
import { TransferLedgerReview } from "./LedgerReview";
import { ReviewStep } from "./ReviewStep";
import { SendTransferStep } from "@/domains/transaction/pages/SendTransfer/SendTransfer.contracts";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { QRModal } from "@/app/components/QRModal";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded } from "@/app/hooks";
import { useKeyup } from "@/app/hooks/use-keyup";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ConfirmSendTransaction } from "@/domains/transaction/components/ConfirmSendTransaction";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useTransaction } from "@/domains/transaction/hooks";
import { useTransactionQueryParameters } from "@/domains/transaction/hooks/use-transaction-query-parameters";
import { assertNetwork, assertWallet } from "@/utils/assertions";
import { useTransactionURL } from "@/domains/transaction/hooks/use-transaction-url";
import { toasts } from "@/app/services";
import { useSearchParametersValidation } from "@/app/hooks/use-search-parameters-validation";
import { isLedgerTransportSupported } from "@/app/contexts/Ledger/transport";
import { isValidUrl } from "@/utils/url-validation";
import {
	TransferFormData,
	TransferOverwriteModal,
} from "@/domains/transaction/pages/SendTransfer/TransferOverwriteModal";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

const MAX_TABS = 5;

export const SendTransfer = () => {
	const navigate = useNavigate();
	const location = useLocation();
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
			await connect(activeProfile, wallet.networkId());
			void handleSubmit(() => submit(true))();
		}
	}, [wallet, activeProfile, connect]);

	useEffect(() => {
		if (activeProfile.wallets().count() === 1 && !wallet) {
			const wallet = activeProfile.wallets().values()[0];
			setWallet(wallet);
		}
	}, [activeProfile, wallet]);

	useEffect(() => {
		if (!shouldResetForm) {
			return;
		}

		setActiveTab(firstTabIndex);

		const resetValues = window.setTimeout(() =>
			resetForm(() => {
				setErrorMessage(undefined);
				setUnconfirmedTransactions([]);
				setTransaction(undefined);
				setWallet(undefined);

				// remove all query params
				navigate(location.pathname);
			}),
		);

		return () => {
			window.clearTimeout(resetValues);
		};
	}, [firstTabIndex, location, resetForm, shouldResetForm]);

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
			} catch (error) {
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
			return navigate(-1);
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

		let newValues = {};

		for (const [qrKey, formKey] of Object.entries({
			amount: "amount",
			memo: "memo",
			recipient: "recipientAddress",
		})) {
			const value = qrData.get(qrKey);

			if (!value) {
				continue;
			}

			if (formHasValues) {
				newValues = { ...newValues, [formKey]: value };
			} else {
				form.setValue(formKey, value, { shouldDirty: true, shouldValidate: true });
			}
		}

		if (Object.keys(newValues).length > 0) {
			setOverwriteData(newValues);
			setShowOverwriteModal(true);
		}

		toasts.success(t("TRANSACTION.QR_CODE_SUCCESS"));
	};

	const renderTabs = () => (
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
				/>
			</TabPanel>

			<TabPanel tabId={SendTransferStep.ReviewStep}>
				<ReviewStep wallet={wallet!} network={activeNetwork} />
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
				/>
			</TabPanel>

			<TabPanel tabId={SendTransferStep.SummaryStep}>
				<TransactionSuccessful transaction={transaction!} senderWallet={wallet!} />
			</TabPanel>

			<TabPanel tabId={SendTransferStep.ErrorStep}>
				<ErrorStep
					onClose={() => {
						assertWallet(wallet);
						navigate(`/profiles/${activeProfile.id()}/dashboard`);
					}}
					isBackDisabled={isSubmitting}
					onBack={() => {
						setActiveTab(SendTransferStep.FormStep);
					}}
					errorMessage={errorMessage}
				/>
			</TabPanel>

			{!hideStepNavigation && (
				<StepNavigation
					onBackClick={handleBack}
					onBackToWalletClick={() => {
						assertWallet(wallet);
						navigate(`/profiles/${activeProfile.id()}/dashboard`);
					}}
					onContinueClick={async () => await handleNext()}
					onSend={() => {
						void handleSubmit(() => submit())();
					}}
					isLoading={isSubmitting}
					isNextDisabled={isNextDisabled}
					size={4}
					activeIndex={activeTab}
				/>
			)}
		</StepsProvider>
	);

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.TRANSFER")} showBottomNavigationBar={false}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-172" context={form}>
					<Tabs activeId={activeTab}>{renderTabs()}</Tabs>

					<TransferOverwriteModal
						isOpen={showOverwriteModal}
						onCancel={() => setShowOverwriteModal(false)}
						onConfirm={(clearPrefilled: boolean) => {
							if (clearPrefilled) {
								for (const key of ["recipientAddress", "amount", "memo"]) {
									form.setValue(key, undefined, { shouldDirty: true, shouldValidate: true });
								}
							}

							for (const [key, value] of Object.entries(overwriteData)) {
								form.setValue(key, value, { shouldDirty: true, shouldValidate: true });
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

				<QRModal
					isOpen={showQRModal}
					onCancel={() => setShowQRModal(false)}
					onRead={(text: string) => handleQRCodeRead(text)}
				/>
			</Section>
		</Page>
	);
};
