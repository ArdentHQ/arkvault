import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { Services } from "@ardenthq/sdk";
import { FormStep } from "./FormStep";
import { SuccessStep } from "./SuccessStep";
import { Page, Section } from "@/app/components/Layout";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider } from "@/app/contexts";

import { Form, FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { useActiveProfile, useActiveWallet } from "@/app/hooks";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";

enum Step {
	FormStep = 1,
	SuccessStep,
	ErrorStep,
}

export enum VerificationMethod {
	Manual,
	Json,
}

export type VerificationResult = { verified?: boolean } & Services.SignedMessage;

export const VerifyMessage: React.VFC = () => {
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();

	const history = useHistory();

	const form = useForm({ mode: "onChange" });

	const { formState, getValues } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(VerificationMethod.Manual);

	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [verificationResult, setVerificationResult] = useState<VerificationResult | undefined>();
	const [activeTab, setActiveTab] = useState(Step.FormStep);

	const handleBack = () => {
		if (activeTab === Step.FormStep || activeTab === Step.SuccessStep) {
			return history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
		}

		setActiveTab(activeTab - 1);
	};

	const submitForm = async () => {
		try {
			const signedMessage: VerificationResult =
				verificationMethod === VerificationMethod.Json
					? JSON.parse(getValues("jsonString"))
					: getValues(["signatory", "message", "signature"]);

			const result = await activeWallet.message().verify(signedMessage);

			setVerificationResult({ ...signedMessage, verified: result });

			setActiveTab(Step.SuccessStep);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));

			setVerificationResult(undefined);
			setActiveTab(Step.ErrorStep);
		}
	};

	return (
		<Page pageTitle={t("MESSAGE.PAGE_VERIFY_MESSAGE.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" data-testid="VerifyMessage" context={form} onSubmit={submitForm}>
					<Tabs activeId={activeTab}>
						<StepsProvider steps={2} activeStep={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep
									method={verificationMethod}
									onMethodChange={(value) => setVerificationMethod(value)}
								/>
							</TabPanel>

							<TabPanel tabId={Step.SuccessStep}>
								<SuccessStep verificationResult={verificationResult} />
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									title={t("MESSAGE.PAGE_VERIFY_MESSAGE.ERROR_STEP.TITLE")}
									description={t("MESSAGE.PAGE_VERIFY_MESSAGE.ERROR_STEP.DESCRIPTION")}
									onBack={() =>
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`)
									}
									errorMessage={errorMessage}
								/>
							</TabPanel>

							{activeTab === Step.FormStep && (
								<FormButtons>
									<Button
										variant="secondary"
										data-testid="VerifyMessage__back-button"
										onClick={handleBack}
									>
										{t("COMMON.BACK")}
									</Button>

									<Button
										data-testid="VerifyMessage__verify-button"
										type="submit"
										disabled={isSubmitting || (isDirty ? !isValid : true)}
									>
										{t("MESSAGE.PAGE_VERIFY_MESSAGE.VERIFY")}
									</Button>
								</FormButtons>
							)}

							{activeTab === Step.SuccessStep && (
								<FormButtons>
									<Button
										onClick={handleBack}
										data-testid="VerifyMessage__back-to-wallet-button"
										variant="secondary"
									>
										<div className="whitespace-nowrap">{t("COMMON.BACK_TO_WALLET")}</div>
									</Button>
								</FormButtons>
							)}
						</StepsProvider>
					</Tabs>
				</Form>
			</Section>
		</Page>
	);
};
