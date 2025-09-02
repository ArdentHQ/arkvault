import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { SendRegistrationForm } from "./SendRegistration.contracts";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useLedgerModelStatus, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import {
	ValidatorRegistrationForm,
	signValidatorRegistration,
} from "@/domains/transaction/components/ValidatorRegistrationForm";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { assertWallet } from "@/utils/assertions";
import {
	signUsernameRegistration,
	UsernameRegistrationForm,
} from "@/domains/transaction/components/UsernameRegistrationForm";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useToggleFeeFields } from "@/domains/transaction/hooks/useToggleFeeFields";
import { getUrlParameter } from "@/utils/paths";
import { useValidatorRegistrationLockedFee } from "@/domains/transaction/components/ValidatorRegistrationForm/hooks/useValidatorRegistrationLockedFee";

export const SendRegistration = () => {
	const navigate = useNavigate();
	const { t } = useTranslation();
	const location = useLocation();

	const [activeTab, setActiveTab] = useState(1);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [registrationForm, setRegistrationForm] = useState<SendRegistrationForm>();
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [isWaitingLedger, setIsWaitingLedger] = useState(false);

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const { common, validatorRegistration } = useValidation();
	const { addPendingTransaction } = usePendingTransactions();

	const { hasDeviceAvailable, isConnected, connect, ledgerDevice } = useLedgerContext();

	const { isLedgerModelSupported } = useLedgerModelStatus({
		connectedModel: ledgerDevice?.id,
		supportedModels: [Contracts.WalletLedgerModel.NanoX, Contracts.WalletLedgerModel.NanoSP],
	});

	const form = useForm({ mode: "onChange" });

	const { formState, register, setValue, watch, getValues, trigger } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { fees, isLoading, senderAddress } = watch();

	const stepCount = registrationForm ? registrationForm.tabSteps + 2 : 1;
	const authenticationStep = stepCount - 1;
	const isAuthenticationStep = activeTab === authenticationStep;

	const activeWalletFromUrl = useActiveWalletWhenNeeded(false);

	const registrationType = useMemo(() => {
		try {
			if (activeWalletFromUrl) {
				return getUrlParameter(location.pathname, 5);
			}

			return getUrlParameter(location.pathname, 3);
		} catch {
			return;
		}
	}, [activeWalletFromUrl]);

	const { activeNetwork: network } = useActiveNetwork({ profile: activeProfile });

	const activeWallet = useMemo(() => {
		if (senderAddress) {
			return activeProfile.wallets().findByAddressWithNetwork(senderAddress, network.id());
		}

		if (activeWalletFromUrl) {
			return activeWalletFromUrl;
		}
	}, [activeProfile, activeWalletFromUrl, network, senderAddress]);

	const { validatorRegistrationFee } = useValidatorRegistrationLockedFee({
		profile: activeProfile,
		wallet: activeWallet,
	});

	useEffect(() => {
		register("fees");

		register("inputFeeSettings");

		register("network", { required: true });
		register("senderAddress", { required: true });

		register("suppressWarning");
		register("isLoading");

		if (registrationType === "validatorRegistration") {
			register("lockedFee", validatorRegistration.lockedFee(activeWallet, getValues));
		}
	}, [register, activeWallet, common, fees, validatorRegistrationFee, validatorRegistration, registrationType]);

	useEffect(() => {
		trigger("lockedFee");
	}, [senderAddress]);

	useToggleFeeFields({
		activeTab,
		form,
		wallet: activeWallet,
	});

	useEffect(() => {
		if (!activeWallet) {
			return;
		}

		setValue("senderAddress", activeWallet.address(), { shouldDirty: true, shouldValidate: true });

		setValue("network", activeProfile.activeNetwork(), { shouldDirty: true, shouldValidate: true });
	}, [activeWallet, env, setValue]);

	useEffect(() => {
		setValue("lockedFee", validatorRegistrationFee, { shouldDirty: true, shouldValidate: true });
	}, [validatorRegistrationFee]);

	useLayoutEffect(() => {
		const registrations = {
			default: () => setRegistrationForm(ValidatorRegistrationForm),
			usernameRegistration: () => setRegistrationForm(UsernameRegistrationForm),
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (registrations[registrationType as keyof typeof registrations] || registrations.default)();
	}, [registrationType]);

	const connectLedger = useCallback(async () => {
		if (activeWallet) {
			await connect(activeProfile);
			setIsWaitingLedger(true);
		}
	}, [activeWallet, activeProfile, connect]);

	useEffect(() => {
		if (!isConnected && ledgerDevice?.id && isWaitingLedger) {
			void connectLedger();
		}

		if (isConnected && isLedgerModelSupported && isWaitingLedger) {
			void handleSubmit();
			setIsWaitingLedger(false);
		}
	}, [ledgerDevice?.id, isConnected, isLedgerModelSupported, isWaitingLedger]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || isNextDisabled || activeTab >= authenticationStep) {
			return;
		}

		return handleNext();
	});

	const handleSubmit = async () => {
		assertWallet(activeWallet);

		try {
			const { mnemonic, secondMnemonic, encryptionPassword, secret, secondSecret } = getValues();

			const signatory = await activeWallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				secondMnemonic,
				secondSecret,
				secret,
			});

			if (registrationType === "validatorRegistration") {
				const transaction = await signValidatorRegistration({
					env,
					form,
					profile: activeProfile,
					signatory,
				});

				addPendingTransaction(transaction);
				setTransaction(transaction);
				handleNext();
			}

			if (registrationType === "usernameRegistration") {
				const transaction = await signUsernameRegistration({
					env,
					form,
					profile: activeProfile,
					signatory,
				});

				addPendingTransaction(transaction);
				setTransaction(transaction);
				handleNext();
			}
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(10);
		}
	};

	const handleBack = () => {
		if (activeTab === 1) {
			return navigate(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		const nextStep = activeTab + 1;
		const isNextStepAuthentication = nextStep === authenticationStep;

		setActiveTab(nextStep);

		if (isNextStepAuthentication && activeWallet?.isLedger()) {
			void connectLedger();
		}
	};

	const hideStepNavigation = activeTab === 10 || (isAuthenticationStep && activeWallet?.isLedger());

	const isNextDisabled = isDirty ? !isValid || !!isLoading : true;

	const getPageTitle = () => {
		if (!registrationType) {
			return;
		}

		return {
			default: t("TRANSACTION.TRANSACTION_TYPES.REGISTER_VALIDATOR"),
			usernameRegistration: t("TRANSACTION.TRANSACTION_TYPES.REGISTER_USERNAME"),
		}[registrationType];
	};

	return (
		<Page pageTitle={getPageTitle()} showBottomNavigationBar={false}>
			<Section className="flex-1">
				<StepsProvider steps={stepCount} activeStep={activeTab}>
					<Form
						data-testid="Registration__form"
						className="mx-auto max-w-172"
						context={form}
						onSubmit={handleSubmit}
					>
						<Tabs activeId={activeTab}>
							<TabPanel tabId={10}>
								<ErrorStep
									onClose={() => navigate(`/profiles/${activeProfile.id()}/dashboard`)}
									isBackDisabled={isSubmitting}
									onBack={() => {
										setActiveTab(1);
									}}
									errorMessage={errorMessage}
								/>
							</TabPanel>

							{registrationForm && (
								<>
									<registrationForm.component
										activeTab={activeTab}
										wallet={activeWallet}
										profile={activeProfile}
									/>

									<TabPanel tabId={authenticationStep}>
										<AuthenticationStep
											wallet={activeWallet!}
											ledgerIsAwaitingDevice={!hasDeviceAvailable}
											ledgerIsAwaitingApp={!isConnected}
											ledgerSupportedModels={[
												Contracts.WalletLedgerModel.NanoX,
												Contracts.WalletLedgerModel.NanoSP,
											]}
											ledgerConnectedModel={ledgerDevice?.id}
											onDeviceNotAvailable={() => {
												//
											}}
										/>
									</TabPanel>

									<TabPanel tabId={stepCount}>
										<TransactionSuccessful transaction={transaction} senderWallet={activeWallet!} />
									</TabPanel>
								</>
							)}

							{!hideStepNavigation && (
								<StepNavigation
									onBackClick={handleBack}
									onBackToWalletClick={() => navigate(`/profiles/${activeProfile.id()}/dashboard`)}
									onContinueClick={() => handleNext()}
									isLoading={isSubmitting || isLoading}
									isNextDisabled={isNextDisabled}
									size={stepCount}
									activeIndex={activeTab}
								/>
							)}
						</Tabs>
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};
