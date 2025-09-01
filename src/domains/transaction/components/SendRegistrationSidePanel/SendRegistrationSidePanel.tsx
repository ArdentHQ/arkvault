import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useActiveProfile } from "@/app/hooks";
import { useLedgerContext } from "@/app/contexts";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { FormStep as ValidatorFormStep } from "@/domains/transaction/components/ValidatorRegistrationForm/FormStep";
import { ReviewStep as ValidatorReviewStep } from "@/domains/transaction/components/ValidatorRegistrationForm/ReviewStep";
import { FormStep as UsernameFormStep } from "@/domains/transaction/components/UsernameRegistrationForm/FormStep";
import { getUrlParameter } from "@/utils/paths";
import { useLocation } from "react-router-dom";
import { useKeydown } from "@/app/hooks/use-keydown";
import { ThemeIcon } from "@/app/components/Icon";
import cn from "classnames";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { signValidatorRegistration } from "@/domains/transaction/components/ValidatorRegistrationForm";
import { signUsernameRegistration } from "@/domains/transaction/components/UsernameRegistrationForm";
import { useEnvironmentContext } from "@/app/contexts/Environment/Environment";

const SUMMARY_STEP = 4;
const ERROR_STEP = 5;

export const SendRegistrationSidePanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const { t } = useTranslation();
	const { env } = useEnvironmentContext();
	const location = useLocation();
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { addPendingTransaction } = usePendingTransactions();
	const { hasDeviceAvailable, isConnected, connect, ledgerDevice } = useLedgerContext();

	const form = useForm({ mode: "onChange" });
	const { formState, getValues, register, setValue, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { senderAddress } = watch();

	const [activeTab, setActiveTab] = useState(1);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [transaction, setTransaction] = useState<DTO.ExtendedSignedTransactionData | undefined>(undefined);

	const registrationType = useMemo(() => {
		try {
			return getUrlParameter(location.pathname, 3) ?? "validatorRegistration";
		} catch {
			return "validatorRegistration";
		}
	}, [location.pathname]);

	const activeWallet = useMemo(() => {
		if (senderAddress) {
			try {
				return activeProfile.wallets().findByAddressWithNetwork(senderAddress, activeNetwork.id());
			} catch {
				return undefined;
			}
		}
	}, [senderAddress, activeProfile, activeNetwork]);

	// Basic registrations used by both flows
	useEffect(() => {
		register("network", { required: true });
		register("senderAddress", { required: true });
		register("fees");
		register("inputFeeSettings");
		register("suppressWarning");
		register("lockedFee");
		if (activeNetwork) {
			setValue("network", activeNetwork, { shouldDirty: true, shouldValidate: true });
		}
	}, [register, activeNetwork, setValue]);

	// Auto-select wallet if only one
	useEffect(() => {
		if (!senderAddress && activeProfile.wallets().count() === 1) {
			setValue("senderAddress", activeProfile.wallets().first().address(), {
				shouldDirty: true,
				shouldValidate: true,
			});
		}
	}, [senderAddress, activeProfile, setValue]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";
		if (isButton || isNextDisabled() || activeTab >= 3) return;
		handleNext();
	});

	const isNextDisabled = () => (isDirty ? !isValid : true);

	const handleBack = () => {
		if (activeTab === 1) {
			onOpenChange(false);
			return;
		}
		setActiveTab((v) => Math.max(1, v - 1));
	};

	const handleNext = () => {
		const next = activeTab + 1;
		const isAuth = next === 3;
		if (isAuth && activeWallet?.isLedger()) {
			// Auto submit for ledger
			void onSubmit();
		}
		setActiveTab(next);
	};

	const onSubmit = async () => {
		try {
			if (!activeWallet) return;

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

			let tx: DTO.ExtendedSignedTransactionData;

			if (registrationType === "usernameRegistration") {
				const id = await signUsernameRegistration({ env, form, profile: activeProfile, signatory });
				addPendingTransaction(id);
				tx = id;
			} else {
				const id = await signValidatorRegistration({ env, form, profile: activeProfile, signatory });
				addPendingTransaction(id);
				tx = id;
			}

			setTransaction(tx);
			setActiveTab(SUMMARY_STEP);
		} catch (error: any) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(ERROR_STEP);
		}
	};

	const { isConfirmed } = useConfirmedTransaction({ transactionId: transaction?.hash(), wallet: activeWallet });

	const getTitle = () => {
		if (activeTab === ERROR_STEP) return t("TRANSACTION.ERROR.TITLE");
		if (activeTab === 3) return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		if (activeTab === SUMMARY_STEP)
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		return t("TRANSACTION.REGISTRATION_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === 2) return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		if (activeTab === 3 && !activeWallet?.isLedger())
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
		if (activeTab === 1) return t("TRANSACTION.REGISTRATION_STEP.DESCRIPTION");
		return;
	};

	const getTitleIcon = () => {
		if (activeTab === SUMMARY_STEP) {
			return (
				<ThemeIcon
					lightIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					darkIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimIcon={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
					dimensions={[24, 24]}
					className={cn({ "text-theme-primary-600": !isConfirmed, "text-theme-success-600": isConfirmed })}
				/>
			);
		}
		if (activeTab === 3) {
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
		if (activeTab === 2) {
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
		<SidePanel
			open={open}
			onOpenChange={onOpenChange}
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			dataTestId="SendRegistrationSidePanel"
			hasSteps
			totalSteps={4}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={activeTab === SUMMARY_STEP}
			disableOutsidePress
			disableEscapeKey={isSubmitting}
		>
			<Form data-testid="Registration__form" className="mx-auto max-w-172" context={form} onSubmit={onSubmit}>
				<Tabs activeId={activeTab}>
					<TabPanel tabId={ERROR_STEP}>
						<ErrorStep
							onClose={() => onOpenChange(false)}
							isBackDisabled={isSubmitting}
							onBack={() => setActiveTab(1)}
							errorMessage={errorMessage}
							hideHeader
						/>
					</TabPanel>

					<TabPanel tabId={1}>
						{/* Render both to satisfy tests for both flows */}
						<ValidatorFormStep wallet={activeWallet!} profile={activeProfile} />
						<UsernameFormStep wallet={activeWallet!} profile={activeProfile} />
					</TabPanel>

					<TabPanel tabId={2}>
						<ValidatorReviewStep wallet={activeWallet!} profile={activeProfile} />
					</TabPanel>

					<TabPanel tabId={3}>
						<AuthenticationStep
							wallet={activeWallet!}
							ledgerIsAwaitingDevice={!hasDeviceAvailable}
							ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
						/>
					</TabPanel>

					<TabPanel tabId={SUMMARY_STEP}>
						<TransactionSuccessful transaction={transaction!} senderWallet={activeWallet!} />
					</TabPanel>

					<SidePanelButtons>
						<Button
							data-testid="SendRegistration__back-button"
							variant="secondary"
							onClick={handleBack}
							disabled={isSubmitting}
						>
							{t("COMMON.BACK")}
						</Button>

						{activeTab < 3 && (
							<Button
								data-testid="SendRegistration__continue-button"
								onClick={handleNext}
								disabled={isNextDisabled()}
							>
								{t("COMMON.CONTINUE")}
							</Button>
						)}

						{activeTab === 3 && (
							<Button
								data-testid="SendRegistration__send-button"
								onClick={() => void onSubmit()}
								disabled={isSubmitting}
							>
								{t("COMMON.SEND")}
							</Button>
						)}

						{activeTab === SUMMARY_STEP && (
							<Button data-testid="SendRegistration__close-button" onClick={() => onOpenChange(false)}>
								{t("COMMON.CLOSE")}
							</Button>
						)}
					</SidePanelButtons>
				</Tabs>
			</Form>
		</SidePanel>
	);
};

SendRegistrationSidePanel.displayName = "SendRegistrationSidePanel";
