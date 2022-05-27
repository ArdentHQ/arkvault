import { uniq } from "@payvo/sdk-helpers";
import { Contracts } from "@payvo/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

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
import { profileAllEnabledNetworkIds } from "@/utils/network-utils";

enum Step {
	NetworkStep = 1,
	WalletOverviewStep = 2,
	ConfirmPassphraseStep = 3,
	EncryptPasswordStep = 4,
	SuccessStep = 5,
}

export const CreateWallet = () => {
	const { persist } = useEnvironmentContext();
	const history = useHistory();
	const { t } = useTranslation();

	const [activeTab, setActiveTab] = useState<Step>(Step.NetworkStep);
	const activeProfile = useActiveProfile();

	const { selectedNetworkIds, setValue: setConfiguration } = useWalletConfig({ profile: activeProfile });

	const form = useForm({ mode: "onChange" });
	const { getValues, formState, register, setValue, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { useEncryption, encryptionPassword, confirmEncryptionPassword } = watch();

	const [isGeneratingWallet, setIsGeneratingWallet] = useState(false);
	const [generationError, setGenerationError] = useState("");
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);

	useEffect(() => {
		register("network", { required: true });
		register("wallet");
		register("mnemonic");
		register("useEncryption");
	}, [register]);

	const handleFinish = () => {
		const wallet = getValues("wallet");
		assertWallet(wallet);

		history.push(`/profiles/${activeProfile.id()}/wallets/${wallet.id()}`);
	};

	const generateWallet = async () => {
		const network = getValues("network");
		assertNetwork(network);

		const locale = activeProfile.settings().get<string>(Contracts.ProfileSetting.Bip39Locale, "english");
		const { mnemonic, wallet } = await activeProfile.walletFactory().generate({
			coin: network.coin(),
			locale,
			network: network.id(),
			wordCount: network.wordCount(),
		});

		setValue("wallet", wallet, { shouldDirty: true, shouldValidate: true });
		setValue("mnemonic", mnemonic, { shouldDirty: true, shouldValidate: true });
	};

	const handleBack = () => {
		if (activeTab === Step.NetworkStep) {
			return history.push(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async (parameters: { encryptionPassword?: string } = {}) => {
		let newIndex = activeTab + 1;

		if (newIndex === Step.EncryptPasswordStep && !useEncryption) {
			newIndex = newIndex + 1;
		}

		if (newIndex === Step.WalletOverviewStep) {
			setGenerationError("");
			setIsGeneratingWallet(true);

			try {
				await generateWallet();
				setActiveTab(newIndex);
			} catch {
				setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
			} finally {
				setIsGeneratingWallet(false);
			}

			return;
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
		const steps = [
			t("WALLETS.PAGE_IMPORT_WALLET.NETWORK_STEP.TITLE"),
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE"),
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE"),
			t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE"),
		];

		if (useEncryption) {
			steps.splice(3, 0, t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"));
		}

		return steps;
	}, [useEncryption, activeTab]);

	return (
		<Page pageTitle={t("WALLETS.PAGE_CREATE_WALLET.TITLE")}>
			<Section className="flex-1">
				<Form className="mx-auto max-w-xl" context={form} onSubmit={handleFinish}>
					<Tabs activeId={activeTab}>
						<StepIndicator steps={allSteps} activeIndex={activeTab} />

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
									error={generationError}
								/>
							</TabPanel>

							<TabPanel tabId={Step.WalletOverviewStep}>
								<WalletOverviewStep />
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
										isLoading={isGeneratingWallet}
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
