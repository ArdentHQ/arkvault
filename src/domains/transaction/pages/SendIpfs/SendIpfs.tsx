import { Services } from "@ardenthq/sdk";
import { DTO } from "@ardenthq/sdk-profiles";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { FormStep } from "./FormStep";
import { IpfsLedgerReview } from "./LedgerReview";
import { ReviewStep } from "./ReviewStep";
import { SummaryStep } from "./SummaryStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWallet, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { FeeWarning } from "@/domains/transaction/components/FeeWarning";
import { useFeeConfirmation, useTransactionBuilder } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { assertWallet } from "@/utils/assertions";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendIpfs = () => {
	const { t } = useTranslation();
	const navigate = useNavigate();

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { env, persist } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();
	const networks = useMemo(() => activeProfile.availableNetworks(), [env]);
	const { sendIpfs, common } = useValidation();

	const form = useForm({ mode: "onChange" });

	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();
	const { clearErrors, formState, getValues, handleSubmit, register, setValue, watch } = form;
	const { isDirty, isValid, isSubmitting } = formState;

	const { fee, fees } = watch();

	const abortReference = useRef(new AbortController());
	const transactionBuilder = useTransactionBuilder();

	useEffect(() => {
		register("network", sendIpfs.network());
		register("senderAddress", sendIpfs.senderAddress());
		register("hash", sendIpfs.hash());
		register("fees");
		register("fee", common.fee(activeWallet.balance(), activeWallet.network()));
		register("inputFeeSettings");

		setValue("senderAddress", activeWallet.address(), { shouldDirty: true, shouldValidate: true });

		register("suppressWarning");

		for (const network of networks) {
			if (network.coin() === activeWallet.coinId() && network.id() === activeWallet.networkId()) {
				setValue("network", network, { shouldDirty: true, shouldValidate: true });

				break;
			}
		}
	}, [activeWallet, networks, register, setValue, t, fees, sendIpfs, common]);

	const { dismissFeeWarning, feeWarningVariant, requireFeeConfirmation, showFeeWarning, setShowFeeWarning } =
		useFeeConfirmation(fee, fees);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || isNextDisabled || activeTab >= Step.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const submitForm = async () => {
		clearErrors("mnemonic");

		const { fee, mnemonic, secondMnemonic, hash, encryptionPassword, wif, privateKey, secret, secondSecret } =
			getValues();

		const signatory = await activeWallet.signatoryFactory().make({
			encryptionPassword,
			mnemonic,
			privateKey,
			secondMnemonic,
			secondSecret,
			secret,
			wif,
		});

		const transactionInput: Services.IpfsInput = {
			data: { hash },
			fee: +fee,
			signatory,
		};

		try {
			const abortSignal = abortReference.current.signal;

			const { uuid, transaction } = await transactionBuilder.build("ipfs", transactionInput, activeWallet, {
				abortSignal,
			});

			const response = await activeWallet.transaction().broadcast(uuid);

			handleBroadcastError(response);

			await activeWallet.transaction().sync();

			await persist();

			setTransaction(transaction);
			setActiveTab(Step.SummaryStep);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const connectLedger = useCallback(async () => {
		await connect(activeProfile, activeWallet.coinId(), activeWallet.networkId());
		handleSubmit(submitForm)();
	}, [activeWallet, activeProfile, connect]);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === Step.FormStep) {
			return navigate(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async (suppressWarning?: boolean) => {
		abortReference.current = new AbortController();

		const newIndex = activeTab + 1;

		if (newIndex === Step.AuthenticationStep && requireFeeConfirmation && !suppressWarning) {
			return setShowFeeWarning(true);
		}

		const { network, senderAddress } = getValues();
		const senderWallet = activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());
		assertWallet(senderWallet);

		// Skip authorization step
		if (newIndex === Step.AuthenticationStep && senderWallet.isMultiSignature()) {
			await handleSubmit(submitForm)();
			return;
		}

		if (newIndex === Step.AuthenticationStep && senderWallet.isLedger()) {
			connectLedger();
		}

		setActiveTab(newIndex);
	};

	const hideStepNavigation =
		activeTab === Step.ErrorStep || (activeTab === Step.AuthenticationStep && activeWallet.isLedger());

	const isNextDisabled = isDirty ? !isValid : true;

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.IPFS")}>
			<Section className="flex-1">
				<StepsProvider steps={4} activeStep={activeTab}>
					<Form className="mx-auto max-w-xl" context={form} onSubmit={submitForm}>
						<Tabs activeId={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep profile={activeProfile} wallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.ReviewStep}>
								<ReviewStep wallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								<AuthenticationStep
									wallet={activeWallet}
									ledgerDetails={<IpfsLedgerReview wallet={activeWallet} />}
									ledgerIsAwaitingDevice={!hasDeviceAvailable}
									ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
								/>
							</TabPanel>

							<TabPanel tabId={Step.SummaryStep}>
								<SummaryStep transaction={transaction} senderWallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onClose={() =>
										navigate(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`)
									}
									isBackDisabled={isSubmitting}
									onBack={() => {
										setActiveTab(Step.FormStep);
									}}
									errorMessage={errorMessage}
								/>
							</TabPanel>

							{!hideStepNavigation && (
								<StepNavigation
									onBackClick={handleBack}
									onBackToWalletClick={() =>
										navigate(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`)
									}
									onContinueClick={async () => await handleNext()}
									isLoading={isSubmitting}
									isNextDisabled={isNextDisabled}
									size={4}
									activeIndex={activeTab}
								/>
							)}
						</Tabs>

						<FeeWarning
							isOpen={showFeeWarning}
							variant={feeWarningVariant}
							onCancel={(suppressWarning: boolean) => dismissFeeWarning(handleBack, suppressWarning)}
							onConfirm={(suppressWarning: boolean) =>
								dismissFeeWarning(async () => await handleNext(true), suppressWarning)
							}
						/>
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};
