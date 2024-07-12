import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DefaultTReturn, TOptions } from "i18next";
import { ConfirmPassphraseStep } from "./ConfirmPassphraseStep";
import { SuccessStep } from "./SuccessStep";
import { WalletOverviewStep } from "./WalletOverviewStep";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
import { Page, Section } from "@/app/components/Layout";
import { StepIndicator } from "@/app/components/StepIndicator";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useWalletConfig } from "@/domains/wallet/hooks";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { NetworkStep } from "@/domains/wallet/components/NetworkStep";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { assertNetwork, assertString, assertWallet } from "@/utils/assertions";
import { enabledNetworksCount, profileAllEnabledNetworkIds, profileAllEnabledNetworks } from "@/utils/network-utils";

enum Step {
	NetworkStep = 1,
	WalletOverviewStep = 2,
	ConfirmPassphraseStep = 3,
	EncryptPasswordStep = 4,
	SuccessStep = 5,
}

export const CreateWallet = () => {
	const { persist } = useEnvironmentContext();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const onlyHasOneNetwork = enabledNetworksCount(activeProfile) === 1;
	const [activeTab, setActiveTab] = useState<Step>(onlyHasOneNetwork ? Step.WalletOverviewStep : Step.NetworkStep);

	const { selectedNetworkIds, setValue: setConfiguration } = useWalletConfig({ profile: activeProfile });

	const form = useForm<any>({
		defaultValues: {
			network: onlyHasOneNetwork ? profileAllEnabledNetworks(activeProfile)[0] : undefined,
			passphraseDisclaimer: false,
		},
		mode: "onChange",
	});
	const { getValues, formState, register, unregister, setValue, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { useEncryption, encryptionPassword, confirmEncryptionPassword, wallet, mnemonic } = watch();

	const [isGeneratingWallet, setIsGeneratingWallet] = useState(onlyHasOneNetwork);
	const [generationError, setGenerationError] = useState<string | DefaultTReturn<TOptions>>("");
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);

	useEffect(() => {
		register("network", { required: true });
		register("wallet");
		register("mnemonic");
		register("useEncryption");
		register("passphraseDisclaimer");
	}, [register]);

	useEffect(() => {
		if (wallet && mnemonic) {
			setIsGeneratingWallet(false);
		}
	}, [wallet, mnemonic]);

	useEffect(() => {
		if (onlyHasOneNetwork) {
			handleGenerateWallet();
		}
	}, []);

	const handleFinish = () => {
		const wallet = getValues("wallet");

		assertWallet(wallet);

		navigate(`/profiles/${activeProfile.id()}/wallets/${wallet.id()}`);
	};

	const generateWallet = () => {
		const network = getValues("network");

		assertNetwork(network);

		const locale = activeProfile.settings().get<string>(Contracts.ProfileSetting.Bip39Locale, "english");

		return activeProfile.walletFactory().generate({
			coin: network.coin(),
			locale,
			network: network.id(),
			wordCount: network.wordCount(),
		});
	};

	const handleGenerateWallet = async () => {
		setGenerationError("");
		setIsGeneratingWallet(true);

		try {
			const { mnemonic, wallet } = await generateWallet();
			setValue("wallet", wallet, { shouldDirty: true, shouldValidate: true });
			setValue("mnemonic", mnemonic, { shouldDirty: true, shouldValidate: true });
			setActiveTab(Step.WalletOverviewStep);
		} catch {
			setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
		}
	};

	const handleBack = () => {
		if (activeTab === Step.NetworkStep || (activeTab === Step.WalletOverviewStep && onlyHasOneNetwork)) {
			return navigate(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async (parameters: { encryptionPassword?: string } = {}) => {
		let newIndex = activeTab + 1;

		if (newIndex === Step.EncryptPasswordStep && !useEncryption) {
			newIndex = newIndex + 1;
		}

		if (newIndex === Step.WalletOverviewStep) {
			handleGenerateWallet();

			return;
		}

		if (newIndex === Step.ConfirmPassphraseStep) {
			register("verification", { required: true });
		} else if (activeTab === Step.ConfirmPassphraseStep) {
			unregister("verification");
		}

		if (newIndex === Step.SuccessStep) {
			const { mnemonic, network } = getValues(["mnemonic", "network"]);

			let wallet = getValues("wallet");

			assertNetwork(network);
			assertString(mnemonic);
			assertWallet(wallet);

			if (useEncryption && parameters.encryptionPassword) {
				setIsGeneratingWallet(true);

				try {
					wallet = await activeProfile.walletFactory().fromMnemonicWithBIP39({
						coin: network.coin(),
						mnemonic,
						network: network.id(),
						password: parameters.encryptionPassword,
					});
				} catch {
					setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
				} finally {
					setIsGeneratingWallet(false);
				}
			}

			assertWallet(wallet);

			wallet.mutator().alias(getDefaultAlias({ network, profile: activeProfile }));

			setValue("wallet", wallet);

			activeProfile.wallets().push(wallet);

			setConfiguration("selectedNetworkIds", uniq([...selectedNetworkIds, network.id()]));

			await persist();
		}

		setActiveTab(newIndex);
	};

	const handlePasswordSubmit = () => {
		assertString(encryptionPassword);

		void handleNext({ encryptionPassword });
	};

	const renderUpdateWalletNameModal = () => {
		if (!isEditAliasModalOpen) {
			return;
		}

		const wallet = getValues("wallet");

		assertWallet(wallet);

		return (
			<UpdateWalletName
				wallet={wallet}
				profile={activeProfile}
				onCancel={() => setIsEditAliasModalOpen(false)}
				onAfterSave={() => setIsEditAliasModalOpen(false)}
			/>
		);
	};

	const allSteps = useMemo(() => {
		const steps: string[] = [];

		if (!onlyHasOneNetwork) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.TITLE"));
		}

		steps.push(
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE"),
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE"),
		);

		if (useEncryption) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"));
		}

		steps.push(t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE"));

		return steps;
	}, [useEncryption, activeTab]);

	const activeTabIndex = useMemo(() => {
		// Since it removes the select network step
		if (onlyHasOneNetwork) {
			return activeTab - 1;
		}

		return activeTab;
	}, [onlyHasOneNetwork, activeTab]);

	return (
		<Page pageTitle={t("WALLETS.PAGE_CREATE_WALLET.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={handleFinish}>
					<Tabs activeId={activeTab}>
						<StepIndicator steps={allSteps} activeIndex={activeTabIndex} />

						<div className="mt-8">
							<TabPanel tabId={Step.NetworkStep}>
								<NetworkStep
									filter={(network) =>
										profileAllEnabledNetworkIds(activeProfile).includes(network.id())
									}
									profile={activeProfile}
									title={t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.TITLE")}
									subtitle={t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.SUBTITLE")}
									disabled={isGeneratingWallet}
									error={`${generationError}`}
								/>
							</TabPanel>

							<TabPanel tabId={Step.WalletOverviewStep}>
								<WalletOverviewStep isGeneratingWallet={isGeneratingWallet} />
							</TabPanel>

							<TabPanel tabId={Step.ConfirmPassphraseStep}>
								<ConfirmPassphraseStep />
							</TabPanel>

							<TabPanel tabId={Step.EncryptPasswordStep}>
								<EncryptPasswordStep />
							</TabPanel>

							<TabPanel tabId={Step.SuccessStep}>
								<SuccessStep onClickEditAlias={() => setIsEditAliasModalOpen(true)} />
							</TabPanel>

							{activeTab <= Step.EncryptPasswordStep && (
								<FormButtons>
									{activeTab < Step.SuccessStep && (
										<Button
											data-testid="CreateWallet__back-button"
											disabled={isGeneratingWallet}
											variant="secondary"
											onClick={handleBack}
										>
											{t("COMMON.BACK")}
										</Button>
									)}

									{activeTab < Step.EncryptPasswordStep && (
										<Button
											data-testid="CreateWallet__continue-button"
											disabled={isDirty ? !isValid || isGeneratingWallet : true}
											isLoading={isGeneratingWallet && activeTab === Step.NetworkStep}
											onClick={() => handleNext()}
										>
											{t("COMMON.CONTINUE")}
										</Button>
									)}

									{activeTab === Step.EncryptPasswordStep && (
										<Button
											data-testid="CreateWallet__continue-encryption-button"
											disabled={
												!isValid ||
												isGeneratingWallet ||
												!encryptionPassword ||
												!confirmEncryptionPassword
											}
											isLoading={isGeneratingWallet}
											onClick={handlePasswordSubmit}
										>
											{t("COMMON.CONTINUE")}
										</Button>
									)}
								</FormButtons>
							)}

							{activeTab === Step.SuccessStep && (
								<FormButtons>
									<Button
										disabled={isSubmitting}
										type="submit"
										data-testid="CreateWallet__finish-button"
									>
										{t("COMMON.GO_TO_WALLET")}
									</Button>
								</FormButtons>
							)}
						</div>
					</Tabs>
				</Form>

				{renderUpdateWalletNameModal()}
			</Section>
		</Page>
	);
};
