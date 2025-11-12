import { Services } from "@/app/lib/mainsail";
import React, { useEffect, useState, JSX } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormStep } from "./FormStep";

import { SuccessStep } from "./SuccessStep";
import { Button } from "@/app/components/Button";
import { Form } from "@/app/components/Form";
import { ThemeIcon } from "@/app/components/Icon";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider } from "@/app/contexts";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Image } from "@/app/components/Image";
import { MessageService } from "@/app/lib/mainsail/message.service";

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

export const VerifyMessageSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const { t } = useTranslation();
	const queryParameters = useQueryParameters();

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
	const { isDirty, isSubmitting, dirtyFields } = formState;

	const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>(VerificationMethod.Manual);

	const [errorMessage, setErrorMessage] = useState<string | undefined>();
	const [verificationResult, setVerificationResult] = useState<VerificationResult | undefined>();
	const [activeTab, setActiveTab] = useState(Step.FormStep);

	const isVerified = verificationResult?.verified;

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

	const handleBack = () => {};

	const handleVerify = async () => {
		try {
			const result = new MessageService().verify(storedMessage);

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

	const getTitle = () => {
		if (activeTab === Step.ErrorStep) {
			return t("MESSAGE.PAGE_VERIFY_MESSAGE.ERROR_STEP.TITLE");
		}

		if (activeTab === Step.SuccessStep) {
			return isVerified
				? t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.VERIFIED.TITLE")
				: t("MESSAGE.PAGE_VERIFY_MESSAGE.SUCCESS_STEP.NOT_VERIFIED.TITLE");
		}

		return t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === Step.FormStep) {
			return t("MESSAGE.PAGE_VERIFY_MESSAGE.FORM_STEP.DESCRIPTION");
		}
	};

	const getTitleIcon = () => {
		if (activeTab === Step.ErrorStep) {
			return <Image name="ErrorHeaderIcon" domain="transaction" className="block h-[20px] w-[20px]" />;
		}

		if (activeTab === Step.SuccessStep) {
			if (isVerified) {
				return (
					<ThemeIcon
						lightIcon="CompletedLight"
						darkIcon="CompletedDark"
						dimIcon="CompletedDim"
						dimensions={[24, 24]}
					/>
				);
			}

			return <Image name="ErrorHeaderIcon" domain="transaction" className="block h-[20px] w-[20px]" />;
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

	const preventAccidentalClosing = dirtyFields.message || activeTab !== Step.FormStep;

	const isLastStep = activeTab === Step.SuccessStep;

	return (
		<SidePanel
			minimizeable={!isLastStep}
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="VerifyMessageSidePanel"
			hasSteps
			totalSteps={2}
			activeStep={activeTab}
			onMountChange={onMountChange}
			disableOutsidePress={preventAccidentalClosing}
			disableEscapeKey={preventAccidentalClosing}
			shakeWhenClosing={preventAccidentalClosing}
			footer={
				<SidePanelButtons>
					{activeTab === Step.FormStep && (
						<div className="grid w-full grid-cols-2 justify-end gap-3 sm:flex">
							<Button data-testid="SignMessage__back-button" variant="secondary" onClick={handleBack}>
								{t("COMMON.BACK")}
							</Button>

							<Button
								type="submit"
								disabled={isSubmitDisabled()}
								onClick={handleVerify}
								data-testid="SignMessage__continue-button"
							>
								{t("COMMON.VERIFY")}
							</Button>
						</div>
					)}

					{isLastStep && (
						<div className="grid w-full grid-cols-2 justify-end gap-3 sm:flex">
							<Button
								data-testid="SignMessage__back-button"
								variant="secondary"
								className="text-base"
								onClick={handleBack}
							>
								{t("COMMON.CLOSE")}
							</Button>
						</div>
					)}
				</SidePanelButtons>
			}
			isLastStep={activeTab === Step.SuccessStep}
		>
			<Form data-testid="VerifyMessage" context={form} onSubmit={handleVerify}>
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
							<div>error</div>
							{/*<ErrorStep*/}
							{/*	description={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.DESCRIPTION")}*/}
							{/*	onClose={handleBack}*/}
							{/*	errorMessage={errorMessage}*/}
							{/*	hideHeader*/}
							{/*	onBack={() => {*/}
							{/*		setAuthenticateLedger(false);*/}

							{/*		setActiveTab(Step.FormStep);*/}
							{/*	}}*/}
							{/*/>*/}
						</TabPanel>
					</StepsProvider>
				</Tabs>
			</Form>
		</SidePanel>
	);
};
