import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { useTranslation } from "react-i18next";
import { SendRegistrationForm } from "@/domains/transaction/components/SendRegistrationSidePanel/SendRegistration.contracts";
import { useUnconfirmedTransactions } from "@/domains/transaction/hooks/use-unconfirmed-transactions";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useLedgerModelStatus, useValidation } from "@/app/hooks";
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
import { useToggleFeeFields } from "@/domains/transaction/hooks/useToggleFeeFields";
import { useValidatorRegistrationLockedFee } from "@/domains/transaction/components/ValidatorRegistrationForm/hooks/useValidatorRegistrationLockedFee";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { ThemeIcon } from "@/app/components/Icon";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import cn from "classnames";
import { useSelectsTransactionSender } from "@/domains/transaction/hooks/use-selects-transaction-sender";
import { getAuthenticationStepSubtitle } from "@/domains/transaction/utils";

export const FORM_STEP = 1;
export const REVIEW_STEP = 2;
export const ERROR_STEP = 10;

export const SendRegistrationSidePanel = ({
	open,
	onOpenChange,
	registrationType,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	registrationType?: "validatorRegistration" | "usernameRegistration";
}) => {
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState(FORM_STEP);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [registrationForm, setRegistrationForm] = useState<SendRegistrationForm>();
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { env } = useEnvironmentContext();
	const activeProfile = useActiveProfile();
	const { common, validatorRegistration } = useValidation();
	const { addUnconfirmedTransactionFromSigned } = useUnconfirmedTransactions();

	const { hasDeviceAvailable, isConnected, connect, ledgerDevice } = useLedgerContext();

	const { isLedgerModelSupported } = useLedgerModelStatus({
		connectedModel: ledgerDevice?.id,
		supportedModels: [Contracts.WalletLedgerModel.NanoX, Contracts.WalletLedgerModel.NanoSP],
	});

	const form = useForm({ mode: "onChange" });

	const { formState, register, setValue, watch, getValues, trigger, reset: resetForm } = form;
	const { isDirty, isSubmitting, isValid, dirtyFields } = formState;

	const { fees, isLoading, senderAddress } = watch();

	const stepCount = registrationForm ? registrationForm.tabSteps + 2 : 1;
	const authenticationStep = stepCount - 1;
	const summaryStep = stepCount;
	const isAuthenticationStep = activeTab === authenticationStep;

	const [mounted, setMounted] = useState(false);
	const { activeWallet } = useSelectsTransactionSender({
		active: mounted,
		onWalletChange: (wallet) => {
			setValue("senderAddress", wallet?.address(), { shouldDirty: true, shouldValidate: true });

			setValue("network", wallet?.network(), { shouldDirty: true, shouldValidate: true });
		},
	});

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
		if (!registrationType) {
			return;
		}

		setValue("lockedFee", validatorRegistrationFee, { shouldDirty: true, shouldValidate: true });
	}, [validatorRegistrationFee, registrationType]);

	useLayoutEffect(() => {
		if (!registrationType) {
			return;
		}

		const registrations = {
			usernameRegistration: () => setRegistrationForm(UsernameRegistrationForm),
			validatorRegistration: () => setRegistrationForm(ValidatorRegistrationForm),
		};

		return registrations[registrationType]();
	}, [registrationType]);

	// Reset ledger authentication steps after reconnecting supported ledger
	useEffect(() => {
		if (isAuthenticationStep && activeWallet?.isLedger() && isLedgerModelSupported) {
			handleSubmit();
		}
	}, [ledgerDevice]);

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

			if (activeWallet.isLedger()) {
				await connect(activeProfile);
			}

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

				addUnconfirmedTransactionFromSigned(transaction);
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

				addUnconfirmedTransactionFromSigned(transaction);
				setTransaction(transaction);
				handleNext();
			}
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(ERROR_STEP);
		}
	};

	const handleBack = () => {
		if (activeTab === FORM_STEP) {
			onOpenChange(false);
			return;
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		const nextStep = activeTab + 1;
		const isNextStepAuthentication = nextStep === authenticationStep;

		// Skip authentication step
		if (isNextStepAuthentication && activeWallet?.isLedger() && isLedgerModelSupported) {
			handleSubmit();
		}

		setActiveTab(nextStep);
	};

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: activeWallet,
	});

	const isNextDisabled = isDirty ? !isValid || !!isLoading : true;

	const handleOpenChange = useCallback(
		(open: boolean) => {
			onOpenChange(open);
		},
		[onOpenChange],
	);

	const onMountChange = useCallback(
		(mounted: boolean) => {
			setMounted(mounted);

			if (!mounted) {
				resetForm(() => {
					setActiveTab(FORM_STEP);
					setErrorMessage(undefined);
				});
			}
		},
		[resetForm],
	);

	const getTitle = () => {
		if (!registrationType) {
			return "";
		}

		if (activeTab === ERROR_STEP) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === summaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		if (activeTab === authenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === REVIEW_STEP) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (registrationType === "validatorRegistration") {
			return activeWallet?.isValidator()
				? t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE_UPDATE")
				: t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.TITLE");
		} else {
			return t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.TITLE");
		}
	};

	const getSubtitle = () => {
		if (activeTab === ERROR_STEP) {
			return t("TRANSACTION.ERROR.DESCRIPTION");
		}

		if (activeTab === summaryStep) {
			return;
		}

		if (activeTab === authenticationStep) {
			return getAuthenticationStepSubtitle({ t, wallet: activeWallet });
		}

		if (activeTab === REVIEW_STEP) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (registrationType === "validatorRegistration") {
			if (activeWallet?.isLegacyValidator()) {
				return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION_LEGACY");
			}
			if (activeWallet?.isValidator()) {
				return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION_UPDATE");
			}
			return t("TRANSACTION.PAGE_VALIDATOR_REGISTRATION.FORM_STEP.DESCRIPTION");
		} else {
			return t("TRANSACTION.PAGE_USERNAME_REGISTRATION.FORM_STEP.DESCRIPTION");
		}
	};

	const getTitleIcon = () => {
		if (activeTab === summaryStep) {
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

		if (activeTab === REVIEW_STEP) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		if (activeTab === authenticationStep) {
			if (activeWallet?.isLedger()) {
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

		return (
			<ThemeIcon
				dimensions={[24, 24]}
				lightIcon="SendTransactionLight"
				darkIcon="SendTransactionDark"
				dimIcon="SendTransactionDim"
			/>
		);
	};

	const preventAccidentalClosing = useMemo(
		() => dirtyFields.username || dirtyFields.validatorPublicKey || activeTab !== FORM_STEP,
		[dirtyFields.username, dirtyFields.validatorPublicKey, activeTab],
	);

	return (
		<SidePanel
			open={open}
			onOpenChange={onOpenChange}
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			dataTestId="SendRegistrationSidePanel"
			hasSteps
			totalSteps={stepCount}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={activeTab === summaryStep}
			disableOutsidePress={preventAccidentalClosing}
			disableEscapeKey={isSubmitting || preventAccidentalClosing}
			shakeWhenClosing={preventAccidentalClosing}
			onMountChange={onMountChange}
			footer={
				<SidePanelButtons>
					{activeTab < stepCount && (
						<Button
							data-testid="SendRegistration__back-button"
							variant="secondary"
							onClick={handleBack}
							disabled={isSubmitting}
						>
							{t("COMMON.BACK")}
						</Button>
					)}

					{activeTab < stepCount - 1 && (
						<Button
							data-testid="SendRegistration__continue-button"
							onClick={handleNext}
							disabled={isNextDisabled || isSubmitting}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					)}

					{activeTab === stepCount - 1 && (
						<Button
							data-testid="SendRegistration__send-button"
							onClick={() => void handleSubmit()}
							disabled={isNextDisabled || isSubmitting || !isValid}
							isLoading={isSubmitting}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{activeTab === stepCount && (
						<Button data-testid="SendRegistration__close-button" onClick={() => handleOpenChange(false)}>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			<Form data-testid="Registration__form" context={form} onSubmit={handleSubmit}>
				<Tabs activeId={activeTab}>
					<TabPanel tabId={ERROR_STEP}>
						<ErrorStep
							onClose={() => {
								onOpenChange(false);
							}}
							isBackDisabled={isSubmitting}
							onBack={() => {
								setActiveTab(FORM_STEP);
							}}
							errorMessage={errorMessage}
							hideHeader
						/>
					</TabPanel>

					{registrationForm && (
						<>
							<registrationForm.component
								activeTab={activeTab}
								wallet={activeWallet}
								profile={activeProfile}
								hideHeader
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
									noHeading
								/>
							</TabPanel>

							<TabPanel tabId={summaryStep}>
								<TransactionSuccessful
									transaction={transaction}
									senderWallet={activeWallet!}
									noHeading
								/>
							</TabPanel>
						</>
					)}
				</Tabs>
			</Form>
		</SidePanel>
	);
};
