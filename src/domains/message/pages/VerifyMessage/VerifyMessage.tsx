import { Coins, Services } from "@ardenthq/sdk";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import {useNavigate, useParams} from "react-router-dom";
import { FormStep } from "./FormStep";
import { SuccessStep } from "./SuccessStep";
import { Page, Section } from "@/app/components/Layout";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider } from "@/app/contexts";
import { Form, FormButtons } from "@/app/components/Form";
import { Button } from "@/app/components/Button";
import { useActiveProfile, useActiveWalletWhenNeeded, useQueryParameters } from "@/app/hooks";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { ProfilePaths } from "@/router/paths";

enum Step {
	FormStep = 1,
	SuccessStep,
	ErrorStep,
}

export enum VerificationMethod {
	Manual,
	Json,
}

interface VerifyMessageFormState {
	message: string;
	signatory: string;
	signature: string;
	jsonString: string;
}

export type VerificationResult = { verified?: boolean } & Services.SignedMessage;

export const VerifyMessage = () => {
	const { t } = useTranslation();

	const { walletId } = useParams<{ walletId: string }>();
	const queryParameters = useQueryParameters();

	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWalletWhenNeeded(!!walletId);

	const navigate = useNavigate();

	const initialState: Services.SignedMessage = {
		message: queryParameters.get("message") || "",
		signatory: queryParameters.get("signatory") || "",
		signature: queryParameters.get("signature") || "",
	};

	const form = useForm<VerifyMessageFormState>({
		defaultValues: initialState,
		mode: "onChange",
	});

	const { errors, formState, setValue, watch } = form;
	const { isDirty, isSubmitting } = formState;

	const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(VerificationMethod.Manual);

	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [verificationResult, setVerificationResult] = useState<VerificationResult | undefined>();
	const [activeTab, setActiveTab] = useState(Step.FormStep);

	const { jsonString, message, signatory, signature } = watch();

	const [storedMessage, setStoredMessage] = useState(initialState);

	useEffect(() => {
		if (verificationMethod === VerificationMethod.Json && (message || signatory || signature)) {
			setValue("jsonString", JSON.stringify({ message, signatory, signature }), {
				shouldDirty: isDirty,
				shouldValidate: isDirty,
			});
		}

		if (verificationMethod === VerificationMethod.Manual && jsonString) {
			setValue("signatory", storedMessage.signatory, { shouldDirty: isDirty, shouldValidate: isDirty });
			setValue("message", storedMessage.message, { shouldDirty: isDirty, shouldValidate: isDirty });
			setValue("signature", storedMessage.signature, { shouldDirty: isDirty, shouldValidate: isDirty });
		}
	}, [verificationMethod, setValue]);

	useEffect(() => {
		if (jsonString) {
			try {
				setStoredMessage(JSON.parse(jsonString));
			} catch {
				// invalid json
			}
		}
	}, [jsonString, message, signatory, signature]);

	useEffect(() => {
		if (message || signatory || signature) {
			setStoredMessage({
				message,
				signatory,
				signature,
			});
		}
	}, [message, signatory, signature]);

	const handleBack = () => {
		if (activeWallet) {
			return navigate(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
		}

		return navigate(ProfilePaths.Welcome);
	};

	const submitForm = async () => {
		try {
			let result: boolean;

			if (activeWallet) {
				result = await activeWallet.message().verify(storedMessage);
			} else {
				const coin: Coins.Coin = activeProfile
					.coins()
					.set("ARK", activeProfile.networks().allByCoin("ARK")[0].id);

				await coin.__construct();

				result = await coin.message().verify(storedMessage);
			}

			setVerificationResult({ ...storedMessage, verified: result });

			setActiveTab(Step.SuccessStep);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));

			setVerificationResult(undefined);
			setActiveTab(Step.ErrorStep);
		}
	};

	const isSubmitDisabled = () => {
		if (isSubmitting) {
			return true;
		}

		if (isDirty || Object.values(initialState).every(Boolean)) {
			return Object.values(errors).length > 0;
		}

		return true;
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
									onClose={handleBack}
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
										disabled={isSubmitDisabled()}
									>
										{t("MESSAGE.PAGE_VERIFY_MESSAGE.VERIFY")}
									</Button>
								</FormButtons>
							)}

							{activeTab === Step.SuccessStep && (
								<FormButtons>
									<Button
										data-testid="VerifyMessage__back-to-wallet-button"
										variant="secondary"
										disabled={!activeWallet?.id()}
										onClick={handleBack}
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
