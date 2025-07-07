import { Services } from "@/app/lib/mainsail";
import React, { useCallback, useEffect, useMemo, useRef, useState, JSX } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Contracts } from "@/app/lib/profiles";
import { FormStep } from "./FormStep";
import { SigningMessageInfo, SuccessStep } from "./SuccessStep";
import { Clipboard } from "@/app/components/Clipboard";
import { Button } from "@/app/components/Button";
import { Form } from "@/app/components/Form";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { Tabs, TabPanel } from "@/app/components/Tabs";
import { StepsProvider, useLedgerContext } from "@/app/contexts";
import { useActiveProfile, useActiveWalletWhenNeeded, useValidation } from "@/app/hooks";
import { useMessageSigner } from "@/domains/message/hooks/use-message-signer";
import { ErrorStep } from "@/domains/transaction/components/ErrorStep";
import { useQueryParameters } from "@/app/hooks/use-query-parameters";
import { AuthenticationStep, LedgerAuthentication } from "@/domains/transaction/components/AuthenticationStep";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { AddressViewSelection } from "@/domains/portfolio/hooks/use-address-panel";

enum Step {
	FormStep = 1,
	SuccessStep,
	ErrorStep,
}

export const SignMessageSidePanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}): JSX.Element => {
	const { t } = useTranslation();

	const activeProfile = useActiveProfile();
	const queryParameters = useQueryParameters();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const walletFromPath = useActiveWalletWhenNeeded(false);

	const walletFromDeeplink = useMemo(() => {
		const address = queryParameters.get("address");

		if (!address || !activeNetwork) {
			return;
		}

		return activeProfile.wallets().findByAddressWithNetwork(address, activeNetwork.id());
	}, [queryParameters]);

	const profileWallets = activeProfile.wallets().values();
	const selectedWallets = activeProfile.wallets().selected();
	const walletSelectionMode = activeProfile.walletSelectionMode();

	const [selectedWallet, setSelectedWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);

	const selectableWallets = useMemo(() => {
		if (walletSelectionMode === AddressViewSelection.single) {
			return [selectedWallets[0]];
		}

		return profileWallets;
	}, [walletSelectionMode, selectedWallets, profileWallets]);

	const [activeTab, setActiveTab] = useState<Step>(Step.FormStep);
	const [authenticateLedger, setAuthenticateLedger] = useState<boolean>(false);

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

	const { formState, getValues, handleSubmit, register, trigger, reset } = form;
	const { isValid } = formState;

	const { signMessage } = useValidation();

	const selectWallet = useCallback(() => {
		if (selectableWallets.length === 1) {
			setSelectedWallet(selectableWallets[0]);
			return;
		}

		setSelectedWallet(walletFromPath || walletFromDeeplink);
	}, [selectableWallets, walletFromPath, walletFromDeeplink]);

	const resetState = useCallback(() => {
		reset();
		setSelectedWallet(undefined);
		setSignedMessage(initialState);
		setActiveTab(Step.FormStep);
		setAuthenticateLedger(false);
		setErrorMessage(undefined);
	}, [reset]);

	const onMountChange = useCallback(
		(mounted: boolean) => {
			if (!mounted) {
				resetState();
				return;
			}

			selectWallet();
		},
		[selectWallet, resetState],
	);

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
			setAuthenticateLedger(true);
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
		if (activeTab === Step.ErrorStep) {
			return t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.TITLE");
		}

		if (authenticateLedger) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === Step.SuccessStep) {
			return t("MESSAGE.PAGE_SIGN_MESSAGE.SUCCESS_STEP.TITLE");
		}

		return t("MESSAGE.PAGE_SIGN_MESSAGE.TITLE");
	};

	const getSubtitle = () => {
		if (authenticateLedger) {
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
			return (
				<ThemeIcon
					lightIcon="CompletedLight"
					darkIcon="CompletedDark"
					dimIcon="CompletedDim"
					dimensions={[24, 24]}
				/>
			);
		}

		if (authenticateLedger) {
			return (
				<ThemeIcon lightIcon="LedgerLight" darkIcon="LedgerDark" dimIcon="LedgerDim" dimensions={[24, 24]} />
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
			footer={
				<SidePanelButtons>
					{activeTab === Step.FormStep && (
						<div className="grid w-full grid-cols-2 justify-end gap-3 sm:flex">
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
						</div>
					)}

					{activeTab === Step.SuccessStep && (
						<div className="grid w-full grid-cols-2 justify-end gap-3 sm:flex">
							<Button
								data-testid="SignMessage__back-button"
								variant="secondary"
								className="text-base"
								onClick={handleBack}
							>
								{t("COMMON.CLOSE")}
							</Button>

							<Clipboard
								buttonVariant="primary"
								variant="button"
								data={JSON.stringify(signedMessage)}
								data-testid="SignMessage__copy-button"
								wrapperClassName="flex-1 sm:flex-none"
								buttonClassName="bg-theme-primary-600 text-center font-semibold text-white hover:bg-theme-primary-700 flex-1 w-full text-base h-12"
							>
								<div
									className="relative inline-flex items-center space-x-3 rounded"
									data-testid="SignMessage__back-to-wallet-button"
								>
									<Icon name="Copy" />
									<div className="hidden whitespace-nowrap sm:block">
										{t("COMMON.COPY_SIGNATURE")}
									</div>
									<div className="block whitespace-nowrap sm:hidden">{t("COMMON.COPY")}</div>
								</div>
							</Clipboard>
						</div>
					)}
				</SidePanelButtons>
			}
		>
			<Form data-testid="SignMessage" context={form} onSubmit={submitForm}>
				<Tabs activeId={activeTab}>
					<StepsProvider steps={selectedWallet?.isLedger() ? 3 : 2} activeStep={activeTab}>
						<TabPanel tabId={Step.FormStep}>
							<div>
								{authenticateLedger && selectedWallet && (
									<div className="mb-4">
										<LedgerAuthentication
											ledgerDetails={
												<SigningMessageInfo
													wallet={selectedWallet}
													message={getValues("message")}
												/>
											}
											ledgerIsAwaitingApp={hasDeviceAvailable && !isConnected}
											ledgerIsAwaitingDevice={!hasDeviceAvailable}
											wallet={selectedWallet}
											noHeading
											subject="message"
										/>
									</div>
								)}
								<FormStep
									disabled={false}
									profile={activeProfile}
									wallets={selectableWallets}
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

						<TabPanel tabId={Step.SuccessStep}>
							{selectedWallet && <SuccessStep signedMessage={signedMessage} wallet={selectedWallet} />}
						</TabPanel>

						<TabPanel tabId={Step.ErrorStep}>
							<ErrorStep
								description={t("MESSAGE.PAGE_SIGN_MESSAGE.ERROR_STEP.DESCRIPTION")}
								onClose={handleBack}
								errorMessage={errorMessage}
								hideHeader
								onBack={() => {
									setAuthenticateLedger(false);

									setActiveTab(Step.FormStep);
								}}
							/>
						</TabPanel>
					</StepsProvider>
				</Tabs>
			</Form>
		</SidePanel>
	);
};
