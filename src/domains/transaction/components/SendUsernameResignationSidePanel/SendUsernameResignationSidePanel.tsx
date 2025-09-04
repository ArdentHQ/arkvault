import { DTO } from "@/app/lib/profiles";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import cn from "classnames";
import { useTranslation } from "react-i18next";
import { FormStep } from "@/domains/transaction/pages/SendUsernameResignation/FormStep";
import { ReviewStep } from "@/domains/transaction/pages/SendUsernameResignation/ReviewStep";
import { usePendingTransactions } from "@/domains/transaction/hooks/use-pending-transactions";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { assertWallet } from "@/utils/assertions";
import { useToggleFeeFields } from "@/domains/transaction/hooks/useToggleFeeFields";
import { httpClient } from "@/app/services";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Button } from "@/app/components/Button";
import { ThemeIcon } from "@/app/components/Icon";
import { useConfirmedTransaction } from "@/domains/transaction/components/TransactionSuccessful/hooks/useConfirmedTransaction";
import { useSelectsTransactionSender } from "@/domains/transaction/hooks/use-selects-transaction-sender";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendUsernameResignationSidePanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}) => {
	const navigate = useNavigate();
	const { t } = useTranslation();

	const form = useForm({ mode: "onChange" });

	const { formState, getValues, register, watch, reset: resetForm, setValue } = form;
	const { isValid, isSubmitting } = formState;

	const { gasLimit, gasPrice } = watch();
	const { common } = useValidation();
	const { addPendingTransaction } = usePendingTransactions();

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { persist } = useEnvironmentContext();

	const activeProfile = useActiveProfile();

	const [mounted, setMounted] = useState(false);
	const { activeWallet, setActiveWallet } = useSelectsTransactionSender({
		active: mounted,
		onWalletChange: (wallet) => {
			setValue("senderAddress", wallet?.address(), { shouldDirty: true, shouldValidate: true });
		},
	});

	useEffect(() => {
		register("fees");

		register("senderAddress", { required: true });

		register("inputFeeSettings");

		register("suppressWarning");
	}, [activeWallet, common, getValues, register]);

	useToggleFeeFields({
		activeTab,
		form,
		wallet: activeWallet,
	});

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || !isValid || activeTab >= Step.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const handleBack = () => {
		if (activeTab === Step.FormStep) {
			return onOpenChange(false);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		const newIndex = activeTab + 1;

		setActiveTab(newIndex);
	};

	const handleSubmit = async () => {
		assertWallet(activeWallet);

		const { mnemonic, secondMnemonic, encryptionPassword, secret, secondSecret } = getValues();

		try {
			httpClient.forgetWalletCache(activeWallet);

			const signatory = await activeWallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				secondMnemonic,
				secondSecret,
				secret,
			});

			const signedTransactionId = await activeWallet.transaction().signUsernameResignation({
				gasLimit,
				gasPrice,
				signatory,
			});

			const response = await activeWallet.transaction().broadcast(signedTransactionId);

			handleBroadcastError(response);

			await persist();

			const transactionData = activeWallet.transaction().transaction(signedTransactionId);

			addPendingTransaction(transactionData);
			setTransaction(transactionData);

			handleNext();
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const stepCount = 4;

	const onMountChange = useCallback(
		(mounted: boolean) => {
			setMounted(mounted);

			if (!mounted) {
				resetForm(() => {
					setActiveTab(Step.FormStep);

					setErrorMessage(undefined);
				});
			}
		},
		[resetForm],
	);

	const { isConfirmed } = useConfirmedTransaction({
		transactionId: transaction?.hash(),
		wallet: activeWallet,
	});

	const getTitle = () => {
		if (activeTab === Step.ErrorStep) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === Step.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === Step.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === Step.SummaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		return t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === Step.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === Step.AuthenticationStep && !activeWallet?.isLedger()) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
		}

		if (activeTab === Step.FormStep) {
			return t("TRANSACTION.PAGE_USERNAME_RESIGNATION.FORM_STEP.DESCRIPTION");
		}

		return;
	};

	const getTitleIcon = () => {
		if (activeTab === Step.SummaryStep) {
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

		if (activeTab === Step.AuthenticationStep) {
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

		if (activeTab === Step.ReviewStep) {
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
			dataTestId="SendUsernameResignationSidePanel"
			hasSteps
			totalSteps={stepCount}
			activeStep={activeTab}
			onBack={handleBack}
			isLastStep={activeTab === Step.SummaryStep}
			disableOutsidePress
			disableEscapeKey={isSubmitting}
			onMountChange={onMountChange}
			footer={
				<SidePanelButtons>
					{activeTab < stepCount && (
						<Button
							data-testid="SendUsernameResignation__back-button"
							variant="secondary"
							onClick={handleBack}
							disabled={isSubmitting}
						>
							{t("COMMON.BACK")}
						</Button>
					)}

					{activeTab < stepCount - 1 && (
						<Button
							data-testid="SendUsernameResignation__continue-button"
							onClick={handleNext}
							disabled={!isValid || isSubmitting}
						>
							{t("COMMON.CONTINUE")}
						</Button>
					)}

					{activeTab === stepCount - 1 && (
						<Button
							data-testid="SendUsernameResignation__send-button"
							onClick={() => void handleSubmit()}
							disabled={!isValid || isSubmitting}
						>
							{t("COMMON.SEND")}
						</Button>
					)}

					{activeTab === stepCount && (
						<Button data-testid="SendUsernameResignation__close-button" onClick={() => onOpenChange(false)}>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			<Form context={form} onSubmit={handleSubmit}>
				<Tabs activeId={activeTab}>
					<TabPanel tabId={Step.FormStep}>
						<FormStep
							senderWallet={activeWallet}
							profile={activeProfile}
							onWalletChange={setActiveWallet}
							hideHeader
						/>
					</TabPanel>

					<TabPanel tabId={Step.ReviewStep}>
						<ReviewStep senderWallet={activeWallet!} profile={activeProfile} hideHeader />
					</TabPanel>

					<TabPanel tabId={Step.AuthenticationStep}>
						<AuthenticationStep wallet={activeWallet!} noHeading />
					</TabPanel>

					<TabPanel tabId={Step.SummaryStep}>
						<TransactionSuccessful senderWallet={activeWallet!} transaction={transaction} noHeading />
					</TabPanel>

					<TabPanel tabId={Step.ErrorStep}>
						<ErrorStep
							onClose={() => navigate(`/profiles/${activeProfile.id()}/dashboard`)}
							isBackDisabled={isSubmitting || !isValid}
							onBack={() => {
								setActiveTab(Step.FormStep);
							}}
							errorMessage={errorMessage}
							hideHeader
						/>
					</TabPanel>
				</Tabs>
			</Form>
		</SidePanel>
	);
};
