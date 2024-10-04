import { Services } from "@ardenthq/sdk";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Contracts } from "@ardenthq/sdk-profiles";
import { FormStep } from "./FormStep";
import { SigningMessageInfo, SuccessStep } from "./SuccessStep";
import { Clipboard } from "@/app/components/Clipboard";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Icon } from "@/app/components/Icon";
import { Page, Section } from "@/app/components/Layout";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useValidation } from "@/app/hooks";
import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useNetworkFromQueryParameters, useQueryParameters } from "@/app/hooks/use-query-parameters";
import { ProfilePaths } from "@/router/paths";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";

enum Step {
	FormStep = 1,
	AuthenticationStep,
	SuccessStep,
	ErrorStep,
}

export const SignMessage: React.VFC = () => {
	const { t } = useTranslation();

	const history = useHistory();

	const { walletId } = useParams<{ walletId: string }>();

	const activeProfile = useActiveProfile();
	const queryParameters = useQueryParameters();
	const activeNetwork = useNetworkFromQueryParameters(activeProfile);
	const isDeeplink = !!activeNetwork;

	const walletFromPath = useActiveWalletWhenNeeded(!!walletId);
	const walletFromDeeplink = useMemo(() => {
		const address = queryParameters.get("address");

		if (!address || !activeNetwork) {
			return;
		}

		return activeProfile.wallets().findByAddressWithNetwork(address, activeNetwork.id());
	}, [queryParameters]);

	const activeWallet = useMemo(() => walletFromPath || walletFromDeeplink, [walletFromPath, walletFromDeeplink]);

	const [selectedWallet, setSelectedWallet] = useState<Contracts.IReadWriteWallet | undefined>(activeWallet);

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const wallets = useMemo(
		() =>
			activeNetwork
				? activeProfile.wallets().findByCoinWithNetwork(activeNetwork.coin(), activeNetwork.id())
				: [],
		[activeNetwork, activeProfile],
	);

	const initialState: Services.SignedMessage = {
		message: queryParameters.get("message") || "",
		signatory: "",
		signature: "",
	};

	const [signedMessage, setSignedMessage] = useState<Services.SignedMessage>(initialState);
	const [errorMessage, setErrorMessage] = useState<string | undefined>();

	const form = useForm({
		defaultValues: {
			encryptionPassword: "",
			message: initialState.message,
			mnemonic: "",
			secret: "",
		},
		mode: "onChange",
	});

	const { formState, getValues, handleSubmit, register, trigger } = form;
	const { isValid } = formState;

	const { signMessage } = useValidation();

	useEffect(() => {
		register("message", signMessage.message(selectedWallet?.isLedger()));
	}, [selectedWallet, register, signMessage]);

	useEffect(() => {
		if (initialState.message) {
			trigger("message");
		}
	}, [trigger]);

	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();

	const abortReference = useRef(new AbortController());
	const { sign } = useMessageSigner();

	const connectLedger = useCallback(async () => {
		await connect(activeProfile, selectedWallet!.coinId(), selectedWallet!.networkId());
		handleSubmit(submitForm)();
	}, [selectedWallet, activeProfile, connect]);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (selectedWallet) {
			return history.push(`/profiles/${activeProfile.id()}/wallets/${selectedWallet.id()}`);
		}

		return history.push(ProfilePaths.Welcome);
	};

	const handleNext = () => {
		abortReference.current = new AbortController();

		if (selectedWallet?.isLedger()) {
			setActiveTab(activeTab + 1);
			connectLedger();
			return;
		}

		handleSubmit(submitForm)();
	};

	const submitForm = async () => {
		const abortSignal = abortReference.current.signal;

		const { message, mnemonic, encryptionPassword, secret } = getValues();

		setActiveTab(activeTab + 1);

		try {
			const signedMessageResult = await sign(selectedWallet!, message, mnemonic, encryptionPassword, secret, {
				abortSignal,
			});

			setSignedMessage(signedMessageResult);

			setActiveTab(Step.SuccessStep);
		} catch (error) {
			setErrorMessage(JSON.stringify({ message: error.message, type: error.name }));
			setActiveTab(Step.ErrorStep);
		}
	};

	const handleSelectAddress: any = useCallback(
		(address: string) => {
			setSelectedWallet(activeProfile.wallets().findByAddressWithNetwork(address, activeNetwork!.id()));
		},
		[activeProfile, activeNetwork],
	);

	return (
		<Page pageTitle={t("MESSAGE.PAGE_SIGN_MESSAGE.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" data-testid="SignMessage" context={form} onSubmit={submitForm}>
					<Tabs activeId={activeTab}>
						<StepsProvider steps={selectedWallet?.isLedger() ? 3 : 2} activeStep={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<div>
									<FormStep
										disabled={!isDeeplink}
										profile={activeProfile}
										wallets={wallets}
										disableMessageInput={false}
										maxLength={signMessage.message().maxLength.value}
										wallet={selectedWallet}
										handleSelectAddress={handleSelectAddress}
									/>

									{selectedWallet && !selectedWallet.isLedger() && (
										<div className="mt-4">
											<AuthenticationStep
												noHeading
												wallet={selectedWallet}
												subject="message"
											/>
										</div>
									)}
								</div>
							</TabPanel>

							<TabPanel tabId={Step.AuthenticationStep}>
								{selectedWallet && (
									<AuthenticationStep
										wallet={selectedWallet}
										ledgerDetails={
											<SigningMessageInfo
												wallet={selectedWallet}
												message={getValues("message")}
											/>
										}
										ledgerIsAwaitingDevice={!hasDeviceAvailable}
										ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
										subject="message"
									/>
								)}
							</TabPanel>

							<TabPanel tabId={Step.SuccessStep}>
								{selectedWallet && (
									<SuccessStep signedMessage={signedMessage} wallet={selectedWallet} />
								)}
							</TabPanel>

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									title={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE")}
									description={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.DESCRIPTION")}
									onClose={handleBack}
									errorMessage={errorMessage}
									onBack={() => {
										setActiveTab(Step.FormStep);
									}}
								/>
							</TabPanel>

							{activeTab === Step.FormStep && (
								<FormButtons>
									<Button
										data-testid="SignMessage__back-button"
										variant="secondary"
										onClick={handleBack}
									>
										{t("COMMON.BACK")}
									</Button>

									<Button
										type="submit"
										disabled={!isValid || !selectedWallet}
										onClick={handleNext}
										data-testid="SignMessage__continue-button"
									>
										{t("COMMON.SIGN")}
									</Button>
								</FormButtons>
							)}

							{activeTab === Step.SuccessStep && (
								<FormButtons>
									<Button
										data-testid="SignMessage__back-button"
										variant="secondary"
										onClick={handleBack}
									>
										{t("COMMON.CLOSE")}
									</Button>

									<Clipboard
										buttonVariant="primary"
										variant="button"
										data={JSON.stringify(signedMessage)}
										data-testid="SignMessage__copy-button"
										wrapperClassName="flex-1 md:flex-none"
									>
										<div
											className="relative inline-flex items-center space-x-3 rounded bg-theme-primary-600 px-5 py-3 text-center text-base font-semibold text-white hover:bg-theme-primary-700"
											data-testid="SignMessage__back-to-wallet-button"
										>
											<Icon name="Copy" />
											<div className="whitespace-nowrap">{t("COMMON.COPY_SIGNATURE")}</div>
										</div>
									</Clipboard>
								</FormButtons>
							)}
						</StepsProvider>
					</Tabs>
				</Form>
			</Section>
		</Page>
	);
};
