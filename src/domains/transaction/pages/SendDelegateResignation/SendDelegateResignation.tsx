import { DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useActiveWallet, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { FeeWarning } from "@/domains/transaction/components/FeeWarning";
import { useFeeConfirmation } from "@/domains/transaction/hooks";
import { handleBroadcastError } from "@/domains/transaction/utils";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendDelegateResignation = () => {
	const history = useHistory();
	const { t } = useTranslation();

	const form = useForm({ mode: "onChange" });

	const { formState, getValues, register, watch } = form;
	const { isValid, isSubmitting } = formState;

	const { fee, fees } = watch();
	const { common } = useValidation();

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);
	const [transaction, setTransaction] = useState(undefined as unknown as DTO.ExtendedSignedTransactionData);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const { persist } = useEnvironmentContext();

	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();

	useEffect(() => {
		register("fees");
		register("fee", common.fee(activeWallet.balance(), activeWallet.network()));
		register("inputFeeSettings");

		register("suppressWarning");
	}, [activeWallet, common, register]);

	const { dismissFeeWarning, feeWarningVariant, requireFeeConfirmation, showFeeWarning, setShowFeeWarning } =
		useFeeConfirmation(fee, fees);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (isButton || !isValid || activeTab >= Step.AuthenticationStep) {
			return;
		}

		return handleNext();
	});

	const handleBack = () => {
		if (activeTab === Step.FormStep) {
			return history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = (suppressWarning?: boolean) => {
		const newIndex = activeTab + 1;

		if (newIndex === Step.AuthenticationStep && requireFeeConfirmation && !suppressWarning) {
			return setShowFeeWarning(true);
		}

		setActiveTab(newIndex);
	};

	const handleSubmit = async () => {
		const { fee, mnemonic, secondMnemonic, encryptionPassword, wif, privateKey, secret, secondSecret } =
			getValues();

		try {
			const signatory = await activeWallet.signatoryFactory().make({
				encryptionPassword,
				mnemonic,
				privateKey,
				secondMnemonic,
				secondSecret,
				secret,
				wif,
			});

			const signedTransactionId = await activeWallet.transaction().signDelegateResignation({
				fee: +fee,
				signatory,
			});

			const response = await activeWallet.transaction().broadcast(signedTransactionId);

			handleBroadcastError(response);

			await persist();

			setTransaction(activeWallet.transaction().transaction(signedTransactionId));

			handleNext();
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hideStepNavigation = activeTab === Step.ErrorStep;

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.VALIDATOR_RESIGNATION")}>
			<Section className="flex-1">
				<StepsProvider steps={4} activeStep={activeTab}>
					<Form className="mx-auto max-w-xl" context={form} onSubmit={handleSubmit}>
						<Tabs activeId={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep senderWallet={activeWallet} profile={activeProfile} />
							</TabPanel>

							<TabPanel tabId={Step.ReviewStep}>
								<ReviewStep senderWallet={activeWallet} profile={activeProfile} />
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								<AuthenticationStep wallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.SummaryStep}>
								<TransactionSuccessful senderWallet={activeWallet} transaction={transaction} />
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onClose={() =>
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`)
									}
									isBackDisabled={isSubmitting || !isValid}
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
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`)
									}
									onContinueClick={() => handleNext()}
									isLoading={isSubmitting}
									isNextDisabled={!isValid}
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
								dismissFeeWarning(() => handleNext(true), suppressWarning)
							}
						/>
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};
