/* eslint-disable max-lines-per-function */
import { DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";

import { useTranslation } from "react-i18next";
import { FormStep } from "./FormStep";
import { ReviewStep } from "./ReviewStep";
import { SummaryStep } from "./SummaryStep";
import { Form } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepNavigation } from "@/app/components/StepNavigation";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { StepsProvider, useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile, useActiveWallet, useValidation } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { handleBroadcastError } from "@/domains/transaction/utils";

enum Step {
	FormStep = 1,
	ReviewStep,
	AuthenticationStep,
	SummaryStep,
	ErrorStep,
}

export const SendUsernameResignation = () => {
	const history = useHistory();
	const { t } = useTranslation();

	const form = useForm({ mode: "onChange" });

	const { formState, getValues, register, errors } = form;
	const { isValid, isSubmitting } = formState;
	console.log({ errors });

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
	}, [activeWallet, common, register]);

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

	const handleNext = () => {
		const newIndex = activeTab + 1;

		if (newIndex === Step.AuthenticationStep && activeWallet.isMultiSignature()) {
			void handleSubmit();
			return;
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

			const signedTransactionId = await activeWallet.transaction().signUsernameResignation({
				fee: +fee,
				signatory,
			});

			const response = await activeWallet.transaction().broadcast(signedTransactionId);

			handleBroadcastError(response);

			await persist();

			setTransaction(activeWallet.transaction().transaction(signedTransactionId));

			if (activeWallet.isMultiSignature()) {
				setActiveTab(Step.SummaryStep);
				return;
			}

			handleNext();
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hideStepNavigation = activeTab === Step.ErrorStep;

	return (
		<Page pageTitle={t("TRANSACTION.TRANSACTION_TYPES.USERNAME_RESIGNATION")}>
			<Section className="flex-1">
				<StepsProvider steps={4} activeStep={activeTab}>
					<Form className="mx-auto max-w-xl" context={form} onSubmit={handleSubmit}>
						<Tabs activeId={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep senderWallet={activeWallet} profile={activeProfile} />
							</TabPanel>

							<TabPanel tabId={Step.ReviewStep}>
								<ReviewStep senderWallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								<AuthenticationStep wallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.SummaryStep}>
								<SummaryStep senderWallet={activeWallet} transaction={transaction} />
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									onClose={() => {
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
									}}
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
					</Form>
				</StepsProvider>
			</Section>
		</Page>
	);
};
