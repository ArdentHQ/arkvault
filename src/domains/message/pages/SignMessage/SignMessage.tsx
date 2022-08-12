import { Services } from "@ardenthq/sdk";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { FormStep } from "./FormStep";
import { SuccessStep } from "./SuccessStep";
import { Clipboard } from "@/app/components/Clipboard";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Page, Section } from "@/app/components/Layout";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWallet, useValidation } from "@/app/hooks";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";

import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { TransactionSender, TransactionDetail } from "@/domains/transaction/components/TransactionDetail";

enum Step {
	FormStep = 1,
	AuthenticationStep,
	SuccessStep,
	ErrorStep,
}

export const SignMessage: React.VFC = () => {
	const { t } = useTranslation();

	const history = useHistory();

	const activeProfile = useActiveProfile();
	const activeWallet = useActiveWallet();

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const initialState: Services.SignedMessage = {
		message: "",
		signatory: "",
		signature: "",
	};

	const [signedMessage, setSignedMessage] = useState<Services.SignedMessage>(initialState);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const form = useForm({ mode: "onChange" });

	const { formState, getValues, handleSubmit, register } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { signMessage } = useValidation();

	useEffect(() => {
		register("message", signMessage.message());
	}, [register, signMessage]);

	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();

	const abortReference = useRef(new AbortController());
	const { sign } = useMessageSigner();

	const connectLedger = useCallback(async () => {
		await connect(activeProfile, activeWallet.coinId(), activeWallet.networkId());
		handleSubmit(submitForm)();
	}, [activeWallet, activeProfile, connect]);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === Step.FormStep || activeTab === Step.SuccessStep) {
			return history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = () => {
		abortReference.current = new AbortController();

		const newIndex = activeTab + 1;

		if (newIndex === Step.AuthenticationStep && activeWallet.isLedger()) {
			connectLedger();
		}

		setActiveTab(newIndex);
	};

	const submitForm = async () => {
		const abortSignal = abortReference.current?.signal;

		const { message, mnemonic, encryptionPassword, secret } = getValues();

		try {
			const signedMessageResult = await sign(activeWallet, message, mnemonic, encryptionPassword, secret, {
				abortSignal,
			});

			setSignedMessage(signedMessageResult);

			setActiveTab(Step.SuccessStep);
		} catch (error) {
			console.log(error);
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const hideStepNavigation = activeTab === Step.AuthenticationStep && activeWallet.isLedger();

	return (
		<Page pageTitle={t("MESSAGE.PAGE_SIGN_MESSAGE.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" data-testid="SignMessage" context={form} onSubmit={submitForm}>
					<Tabs activeId={activeTab}>
						<StepsProvider steps={3} activeStep={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep
									disableMessageInput={false}
									maxLength={signMessage.message().maxLength?.value}
									wallet={activeWallet}
								/>
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								<AuthenticationStep
									wallet={activeWallet}
									ledgerDetails={
										<>
											<TransactionSender
												address={activeWallet.address()}
												network={activeWallet.network()}
												paddingPosition="bottom"
												border={false}
											/>

											<TransactionDetail label={t("COMMON.MESSAGE")}>
												{getValues("message")}
											</TransactionDetail>
										</>
									}
									ledgerIsAwaitingDevice={!hasDeviceAvailable}
									ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
									subject="message"
								/>
							</TabPanel>

							<TabPanel tabId={Step.SuccessStep}>
								<SuccessStep signedMessage={signedMessage} wallet={activeWallet} />
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									title={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE")}
									description={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.DESCRIPTION")}
									onBack={() =>
										history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`)
									}
									errorMessage={errorMessage}
								/>
							</TabPanel>

							{activeTab === Step.FormStep && (
								<FormButtons>
									<Button
										data-testid="SignMessage__back-button"
										variant="secondary"
										disabled={!activeWallet}
										onClick={handleBack}
									>
										{t("COMMON.BACK")}
									</Button>

									<Button
										disabled={!isValid}
										onClick={handleNext}
										data-testid="SignMessage__continue-button"
									>
										{t("COMMON.CONTINUE")}
									</Button>
								</FormButtons>
							)}

							{activeTab === Step.AuthenticationStep && !hideStepNavigation && (
								<FormButtons>
									<Button
										data-testid="SignMessage__back-button"
										variant="secondary"
										onClick={handleBack}
									>
										{t("COMMON.BACK")}
									</Button>

									<Button
										data-testid="SignMessage__sign-button"
										type="submit"
										disabled={isSubmitting || (isDirty ? !isValid : true)}
										isLoading={isSubmitting}
									>
										{t("COMMON.SIGN")}
									</Button>
								</FormButtons>
							)}

							{activeTab === Step.SuccessStep && (
								<FormButtons>
									<div className="mr-auto">
										<Clipboard
											variant="button"
											data={JSON.stringify(signedMessage)}
											data-testid="SignMessage__copy-button"
											wrapperClassName="flex-1 md:flex-none"
											className="w-full"
										>
											<Icon name="Copy" />
											<span className="whitespace-nowrap">
												{t("MESSAGE.PAGE_SIGN_MESSAGE.COPY_JSON")}
											</span>
										</Clipboard>
									</div>

									<Button
										onClick={handleBack}
										data-testid="SignMessage__back-to-wallet-button"
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
