import { Services } from "@/app/lib/mainsail";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory, useParams } from "react-router-dom";
import { Contracts } from "@/app/lib/profiles";
import { FormStep } from "./FormStep";
import { SigningMessageInfo, SuccessStep } from "./SuccessStep";
import { Clipboard } from "@/app/components/Clipboard";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useValidation } from "@/app/hooks";
import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { ProfilePaths } from "@/router/paths";
import { AuthenticationStep } from "@/domains/transaction/components/AuthenticationStep";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
enum Step {
	FormStep = 1,
	AuthenticationStep,
	SuccessStep,
	ErrorStep,
}

export const SignMessageSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const { t } = useTranslation();

	const history = useHistory();

	const { walletId } = useParams<{ walletId: string }>();

	const activeProfile = useActiveProfile();
	const queryParameters = useQueryParameters();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

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
		await connect(activeProfile, selectedWallet!.networkId());
		handleSubmit(submitForm)();
	}, [selectedWallet, activeProfile, connect]);

	const handleBack = () => {
		// Abort any existing listener
		abortReference.current.abort();

		onOpenChange(false);
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
			setSelectedWallet(activeProfile.wallets().findByAddressWithNetwork(address, activeNetwork.id()));
		},
		[activeProfile, activeNetwork],
	);

	const getTitle = () => {
		if (activeTab === Step.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === Step.SuccessStep) {
			return t("MESSAGE.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE");
		}

		return t("MESSAGE.PAGE_SIGN_MESSAGE.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === Step.AuthenticationStep) {
			return t("MESSAGE.PAGE_SIGN_MESSAGE.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
		}

		if (activeTab === Step.FormStep) {
			if (!selectedWallet) {
				return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SELECT_WALLET");
			}

			if (selectedWallet.isLedger()) {
				return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_LEDGER");
			}

			if (selectedWallet.actsWithSecret()) {
				return t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_SECRET");
			}

			return selectedWallet.signingKey().exists()
				? t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_ENCRYPTION_PASSWORD")
				: t("MESSAGE.PAGE_SIGN_MESSAGE.FORM_STEP.DESCRIPTION_MNEMONIC");
		}
	};

	const getTitleIcon = () => {
		if (activeTab === Step.SuccessStep) {
			return <ThemeIcon lightIcon="CompletedLight" darkIcon="CompletedDark" dimensions={[24, 24]} />;
		}

		if (activeTab === Step.AuthenticationStep && selectedWallet?.isLedger()) {
			return <ThemeIcon lightIcon="LedgerLight" darkIcon="LedgerDark" dimensions={[24, 24]} />;
		}

		return <ThemeIcon lightIcon="SignMessageLight" darkIcon="SignMessageDark" dimensions={[24, 24]} />;
	};
	return (
		<SidePanel
			title={getTitle()}
			subtitle={getSubtitle()}
			titleIcon={getTitleIcon()}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="SignMessageSidePanel"
			onMountChange={onMountChange}
			hasSteps
			totalSteps={selectedWallet?.isLedger() ? 3 : 2}
			activeStep={activeTab}
		>
			<Form data-testid="SignMessage" context={form} onSubmit={submitForm}>
				<Tabs activeId={activeTab}>
					<StepsProvider steps={selectedWallet?.isLedger() ? 3 : 2} activeStep={activeTab}>
						<TabPanel tabId={Step.FormStep}>
							<div>
								<FormStep
									disabled={false}
									profile={activeProfile}
									wallets={activeProfile.wallets().values()}
									disableMessageInput={false}
									maxLength={signMessage.message().maxLength.value}
									wallet={selectedWallet}
									handleSelectAddress={handleSelectAddress}
								/>

								{selectedWallet && !selectedWallet.isLedger() && (
									<div className="mt-4">
										<AuthenticationStep noHeading wallet={selectedWallet} subject="message" />
									</div>
								)}
							</div>
						</TabPanel>

						<TabPanel tabId={Step.AuthenticationStep}>
							{selectedWallet && (
								<AuthenticationStep
									wallet={selectedWallet}
									ledgerDetails={
										<SigningMessageInfo wallet={selectedWallet} message={getValues("message")} />
									}
									ledgerIsAwaitingDevice={!hasDeviceAvailable}
									ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
									subject="message"
									noHeading
								/>
							)}
						</TabPanel>

						<TabPanel tabId={Step.SuccessStep}>
							{selectedWallet && <SuccessStep signedMessage={signedMessage} wallet={selectedWallet} />}
						</TabPanel>

						<TabPanel tabId={Step.ErrorStep}>
							<ErrorStep
								title={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE")}
								description={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.DESCRIPTION")}
								onClose={handleBack}
								errorMessage={errorMessage}
								hideHeader
								onBack={() => {
									setActiveTab(Step.FormStep);
								}}
							/>
						</TabPanel>

						{activeTab === Step.FormStep && (
							<FormButtons>
								<Button data-testid="SignMessage__back-button" variant="secondary" onClick={handleBack}>
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
								<Button data-testid="SignMessage__back-button" variant="secondary" onClick={handleBack}>
									{t("COMMON.CLOSE")}
								</Button>

								<Clipboard
									buttonVariant="primary"
									variant="button"
									data={JSON.stringify(signedMessage)}
									data-testid="SignMessage__copy-button"
									wrapperClassName="flex-1 md:flex-none"
									buttonClassName="bg-theme-primary-600 text-center text-base font-semibold text-white hover:bg-theme-primary-700"
								>
									<div
										className="relative inline-flex items-center space-x-3 rounded"
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
		</SidePanel>
	);
};
