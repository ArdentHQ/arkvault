import { Contracts, DTO } from "@payvo/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { FormStep } from "./FormStep";
import { TransferLedgerReview } from "./LedgerReview";
import { NetworkStep } from "./NetworkStep";
import { ReviewStep } from "./ReviewStep";
import { SummaryStep } from "./SummaryStep";
import { SendTransferStep } from "@/domains/transaction/pages/SendTransfer/SendTransfer.contracts";
import { useSendTransferForm } from "@/domains/transaction/hooks/use-send-transfer-form";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useNetworks } from "@/app/hooks";
import { useKeyup } from "@/app/hooks/use-keyup";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ConfirmSendTransaction } from "@/domains/transaction/components/ConfirmSendTransaction";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { FeeWarning } from "@/domains/transaction/components/FeeWarning";
import { useFeeConfirmation, useTransaction } from "@/domains/transaction/hooks";
import { useTransactionQueryParameters } from "@/domains/transaction/hooks/use-transaction-query-parameters";
import { assertNetwork, assertWallet } from "@/utils/assertions";

const MAX_TABS = 5;

export const SendTransfer: React.VFC = () => {
	const history = useHistory();
	const { t } = useTranslation();

	const activeWallet = useActiveWalletWhenNeeded(false);
	const activeProfile = useActiveProfile();
	const networks = useNetworks(activeProfile);
	const { fetchWalletUnconfirmedTransactions } = useTransaction();
	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();
	const {
		hasAnyParameters: hasDeepLinkParameters,
		hasReset: shouldResetForm,
		queryParameters: deepLinkParameters,
	} = useTransactionQueryParameters();

	const abortReference = useRef(new AbortController());

	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const showNetworkStep = !hasDeepLinkParameters && !activeWallet && networks.length > 1;
	const firstTabIndex = showNetworkStep ? SendTransferStep.NetworkStep : SendTransferStep.FormStep;
	const [activeTab, setActiveTab] = useState<SendTransferStep>(firstTabIndex);

	const [unconfirmedTransactions, setUnconfirmedTransactions] = useState<DTO.ExtendedConfirmedTransactionData[]>([]);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);

	const [wallet, setWallet] = useState<Contracts.IReadWriteWallet | undefined>(activeWallet);

	const {
		form,
		resetForm,
		submitForm,
		handleSubmit,
		getValues,
		lastEstimatedExpiration,
		values: { fee, fees, network, senderAddress },
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
		await connect(activeProfile, activeWallet!.coinId(), activeWallet!.networkId());
		void handleSubmit(() => submit(true))();
	}, [activeWallet, activeProfile, connect]);

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
				history.replace(history.location.pathname);
			}),
		);

		return () => {
			window.clearTimeout(resetValues);
		};
	}, [firstTabIndex, history, resetForm, shouldResetForm]);

	useEffect(() => {
		if (!showNetworkStep) {
			return;
		}

		resetForm();
	}, [resetForm]); // eslint-disable-line react-hooks/exhaustive-deps

	const { dismissFeeWarning, feeWarningVariant, requireFeeConfirmation, showFeeWarning, setShowFeeWarning } =
		useFeeConfirmation(fee, fees);

	useEffect(() => {
		if (network) {
			setWallet(activeProfile.wallets().findByAddressWithNetwork(senderAddress || "", network.id()));
		}
	}, [activeProfile, network, senderAddress]);

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

				setTransaction(transaction);
				setActiveTab(SendTransferStep.SummaryStep);
			} catch (error) {
				setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
				setActiveTab(SendTransferStep.ErrorStep);
			}
		},
		[fetchWalletUnconfirmedTransactions, submitForm, wallet],
	);
	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === firstTabIndex) {
			return history.go(-1);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async (suppressWarning?: boolean) => {
		abortReference.current = new AbortController();

		const { network, senderAddress } = getValues();
		assertNetwork(network);
		const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());

		const nextStep = activeTab + 1;

		if (nextStep === SendTransferStep.AuthenticationStep && requireFeeConfirmation && !suppressWarning) {
			setShowFeeWarning(true);
			return;
		}

		if (nextStep === SendTransferStep.AuthenticationStep && senderWallet?.isMultiSignature()) {
			await handleSubmit(() => submit(true))();
			return;
		}

		if (nextStep === SendTransferStep.AuthenticationStep && senderWallet?.isLedger()) {
			connectLedger();
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

	const renderTabs = () => (
		<StepsProvider
			steps={showNetworkStep ? MAX_TABS : MAX_TABS - 1}
			activeStep={showNetworkStep ? activeTab + 1 : activeTab}
		>
			<TabPanel tabId={SendTransferStep.NetworkStep}>
				<NetworkStep profile={activeProfile} networks={networks} />
			</TabPanel>

			<TabPanel tabId={SendTransferStep.FormStep}>
				<FormStep networks={networks} profile={activeProfile} deeplinkProps={deepLinkParameters} />
			</TabPanel>

			<TabPanel tabId={SendTransferStep.ReviewStep}>
				<ReviewStep wallet={wallet!} />
			</TabPanel>

			<TabPanel tabId={SendTransferStep.AuthenticationStep}>
				<AuthenticationStep
					wallet={wallet!}
					ledgerDetails={
						<TransferLedgerReview wallet={wallet!} estimatedExpiration={lastEstimatedExpiration} />
					}
					ledgerIsAwaitingDevice={!hasDeviceAvailable}
					ledgerIsAwaitingApp={!isConnected}
				/>
			</TabPanel>

			<TabPanel tabId={SendTransferStep.SummaryStep}>
				<SummaryStep transaction={transaction!} senderWallet={wallet!} profile={activeProfile} />
			</TabPanel>

			<TabPanel tabId={SendTransferStep.ErrorStep}>
				<ErrorStep
					onBack={() => {
						assertWallet(wallet);
						history.push(`/profiles/${activeProfile.id()}/wallets/${wallet.id()}`);
					}}
					isRepeatDisabled={isSubmitting}
					onRepeat={handleSubmit(() => submit())}
					errorMessage={errorMessage}
				/>
			</TabPanel>

			{!hideStepNavigation && (
				<StepNavigation
					onBackClick={handleBack}
					onBackToWalletClick={() => {
						assertWallet(wallet);
						history.push(`/profiles/${activeProfile.id()}/wallets/${wallet.id()}`);
					}}
					onContinueClick={async () => await handleNext()}
					isLoading={isSubmitting}
					isNextDisabled={isNextDisabled}
					size={4}
					activeIndex={activeTab}
				/>
			)}
		</StepsProvider>
	);

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.TRANSFER")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={() => submit()}>
					<Tabs activeId={activeTab}>{renderTabs()}</Tabs>

					<FeeWarning
						isOpen={showFeeWarning}
						variant={feeWarningVariant}
						onCancel={(suppressWarning: boolean) => dismissFeeWarning(handleBack, suppressWarning)}
						onConfirm={(suppressWarning: boolean) =>
							dismissFeeWarning(async () => await handleNext(true), suppressWarning)
						}
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
			</Section>
		</Page>
	);
};
