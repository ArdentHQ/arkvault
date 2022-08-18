import { Networks, Services } from "@ardenthq/sdk";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { useActiveProfile, useActiveWallet, useActiveWalletWhenNeeded, useValidation } from "@/app/hooks";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { TransactionSender, TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { useParams } from "react-router-dom";
import { ProfilePaths } from "@/router/paths";
import { profileAllEnabledNetworks } from "@/utils/network-utils";

enum Step {
	FormStep = 1,
	AuthenticationStep,
	SuccessStep,
	ErrorStep,
}

export const SignMessage: React.VFC = () => {
	const { t } = useTranslation();

	const history = useHistory();

	const { walletId: hasWalletId } = useParams<{ walletId: string }>();

	const activeProfile = useActiveProfile();

	const activeWallet = useActiveWalletWhenNeeded(!!hasWalletId);
	const [selectedWallet, setSelectedWallet] = useState<Contracts.IReadWriteWallet | undefined>(activeWallet);
	const allEnabledNetworks = profileAllEnabledNetworks(activeProfile);

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);

	const queryParameters = useQueryParameters();

	const activeNetwork = useMemo<Networks.Network | undefined>(() => {
		const nethash = queryParameters.get("nethash");

		if (!!hasWalletId || !nethash) {
			return undefined;
		}

		return allEnabledNetworks.find((item) => item.meta().nethash === nethash);
	}, [allEnabledNetworks, queryParameters]);

	const wallets = useMemo(() => {
		return activeNetwork
			? activeProfile.wallets().findByCoinWithNetwork(activeNetwork.coin(), activeNetwork.id())
			: [];
	}, [activeNetwork, activeProfile]);

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

	const { formState, getValues, handleSubmit, register } = form;
	const { isSubmitting, isValid } = formState;

	const { signMessage } = useValidation();

	useEffect(() => {
		register("message", signMessage.message());
	}, [register, signMessage]);

	const { hasDeviceAvailable, isConnected, connect } = useLedgerContext();

	const abortReference = useRef(new AbortController());
	const { sign } = useMessageSigner();

	const connectLedger = useCallback(async () => {
		await connect(activeProfile, selectedWallet!.coinId(), selectedWallet!.networkId());
		handleSubmit(submitForm)();
	}, [activeWallet, activeProfile, connect]);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		if (activeTab === Step.AuthenticationStep) {
			return setActiveTab(activeTab - 1);
		}

		if (activeWallet) {
			return history.push(`/profiles/${activeProfile.id()}/wallets/${activeWallet.id()}`);
		}

		return history.push(ProfilePaths.Welcome);
	};

	const handleNext = () => {
		abortReference.current = new AbortController();

		const newIndex = activeTab + 1;

		if (newIndex === Step.AuthenticationStep && selectedWallet!.isLedger()) {
			connectLedger();
		}

		setActiveTab(newIndex);
	};

	const submitForm = async () => {
		const abortSignal = abortReference.current.signal;

		const { message, mnemonic, encryptionPassword, secret } = getValues();

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

	const hideStepNavigation = activeTab === Step.AuthenticationStep && selectedWallet && selectedWallet.isLedger();

	const handleSelectAddress = useCallback(
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
						<StepsProvider steps={3} activeStep={activeTab}>
							<TabPanel tabId={Step.FormStep}>
								<FormStep
									disabled={!!activeWallet}
									profile={activeProfile}
									wallets={wallets}
									disableMessageInput={false}
									maxLength={signMessage.message().maxLength?.value}
									wallet={selectedWallet}
									handleSelectAddress={handleSelectAddress}
								/>
							</TabPanel>

							{selectedWallet && (
								<>
									<TabPanel tabId={Step.AuthenticationStep}>
										<AuthenticationStep
											wallet={selectedWallet!}
											ledgerDetails={
												<>
													<TransactionSender
														address={selectedWallet.address()}
														network={selectedWallet.network()}
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
										<SuccessStep signedMessage={signedMessage} wallet={selectedWallet} />
									</TabPanel>
								</>
							)}

							<TabPanel tabId={Step.ErrorStep}>
								<ErrorStep
									title={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE")}
									description={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.DESCRIPTION")}
									onBack={handleBack}
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
										disabled={isSubmitting || !isValid}
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
