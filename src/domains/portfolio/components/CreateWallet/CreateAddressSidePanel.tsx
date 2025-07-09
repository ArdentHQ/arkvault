import { DefaultTReturn, TOptions } from "i18next";
import React, { useEffect, useMemo, useState, JSX, useRef } from "react";
import { SidePanel, SidePanelButtons } from "@/app/components/SidePanel/SidePanel";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { WalletOverviewStep } from "@/domains/portfolio/components/CreateWallet/WalletOverviewStep";
import { ConfirmPassphraseStep } from "@/domains/portfolio/components/CreateWallet/ConfirmPassphraseStep";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { SuccessStep } from "@/domains/portfolio/components/CreateWallet/SuccessStep";
import { Button } from "@/app/components/Button";
import { useEnvironmentContext } from "@/app/contexts";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useActiveProfile } from "@/app/hooks";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useWalletImport } from "@/domains/wallet/hooks";
import { useForm } from "react-hook-form";
import { assertNetwork, assertString, assertWallet } from "@/utils/assertions";
import { getDefaultAlias } from "@/domains/wallet/utils/get-default-alias";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { Contracts } from "@/app/lib/profiles";
import { CreateStep, useCreateStepHeaderConfig } from "./CreateAddressSidePanel.blocks";

export const CreateAddressesSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const { persist } = useEnvironmentContext();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const activeProfile = useActiveProfile();
	const [activeTab, setActiveTab] = useState<CreateStep>(CreateStep.WalletOverviewStep);
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const form = useForm<any>({
		defaultValues: {
			network: activeNetwork,
			passphraseDisclaimer: false,
		},
		mode: "onChange",
	});

	const { getValues, formState, register, setValue, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;

	const { useEncryption, encryptionPassword, confirmEncryptionPassword, wallet, mnemonic, acceptResponsibility } =
		watch();

	const [isGeneratingWallet, setIsGeneratingWallet] = useState(true);
	const [_, setGenerationError] = useState<string | DefaultTReturn<TOptions>>("");
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);

	const { title, subtitle, titleIcon } = useCreateStepHeaderConfig(activeTab);

	const prevOpenRef = useRef(open);
	useEffect(() => {
		if (prevOpenRef.current && !open) {
			setActiveTab(CreateStep.WalletOverviewStep);
		}
		prevOpenRef.current = open;
	}, [open]);

	useEffect(() => {
		if (!open) {
			return;
		}

		let historyPushed = false;

		const handlePopState = (event) => {
			if (activeTab > CreateStep.WalletOverviewStep) {
				event.preventDefault();
				event.stopImmediatePropagation();

				handleBack();
			}
		};

		if (!historyPushed) {
			window.history.pushState({ createPanelStep: activeTab }, "");
			historyPushed = true;
		}

		window.addEventListener("popstate", handlePopState, true);

		return () => {
			window.removeEventListener("popstate", handlePopState, true);
		};
	}, [open, activeTab]);

	useEffect(() => {
		register("network", { required: true });
		register({ name: "useEncryption", type: "boolean", value: false });
		register({ name: "acceptResponsibility", type: "boolean", value: false });
		register("wallet");
		register("mnemonic");
		register("passphraseDisclaimer");
	}, [register, open]);

	useEffect(() => {
		if (open) {
			void handleGenerateWallet();
		}
	}, [open]);

	useEffect(() => {
		if (wallet && mnemonic) {
			setIsGeneratingWallet(false);
		}
	}, [wallet, mnemonic]);

	const handleFinish = () => {
		onOpenChange(false);
	};

	const generateWallet = () => {
		const network = getValues("network");

		assertNetwork(network);

		const locale = activeProfile.settings().get<string>(Contracts.ProfileSetting.Bip39Locale, "english");

		return activeProfile.walletFactory().generate({
			locale,
			wordCount: network.wordCount(),
		});
	};

	const handleGenerateWallet = async () => {
		setGenerationError("");
		setIsGeneratingWallet(true);

		try {
			const { mnemonic, wallet } = await generateWallet();
			wallet.mutator().isSelected(true);

			setValue("wallet", wallet, { shouldDirty: true, shouldValidate: true });
			setValue("mnemonic", mnemonic, { shouldDirty: true, shouldValidate: true });
			setActiveTab(CreateStep.WalletOverviewStep);
		} catch {
			setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
		}
	};

	const handleBack = () => {
		if (activeTab === CreateStep.WalletOverviewStep) {
			return navigate(`/profiles/${activeProfile.id()}/dashboard`);
		}

		setActiveTab(activeTab - 1);
	};

	const handleNext = async (parameters: { encryptionPassword?: string } = {}) => {
		let newIndex = activeTab + 1;

		if (newIndex === CreateStep.EncryptPasswordStep && !useEncryption) {
			newIndex = newIndex + 1;
		}

		if (newIndex === CreateStep.WalletOverviewStep) {
			void handleGenerateWallet();

			return;
		}

		if (newIndex === CreateStep.SuccessStep) {
			const { mnemonic, network } = getValues(["mnemonic", "network"]);

			let wallet = getValues("wallet");

			assertNetwork(network);
			assertString(mnemonic);
			assertWallet(wallet);

			if (useEncryption && parameters.encryptionPassword) {
				setIsGeneratingWallet(true);

				try {
					wallet = await activeProfile.walletFactory().fromMnemonicWithBIP39({
						mnemonic,
						password: parameters.encryptionPassword,
					});
				} catch {
					setIsGeneratingWallet(false);
					setGenerationError(t("WALLETS.PAGE_CREATE_WALLET.NETWORK_STEP.GENERATION_ERROR"));
					return;
				}
			}

			setIsGeneratingWallet(false);

			assertWallet(wallet);
			wallet.mutator().alias(getDefaultAlias({ profile: activeProfile }));

			await importWallets({
				type: "bip39",
				value: mnemonic,
			});

			setValue("wallet", wallet);

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

		steps.push(
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE"),
			t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE"),
		);

		if (useEncryption) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"));
		}

		steps.push(t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE"));

		return steps;
	}, [useEncryption, t]);

	const isNextDisabled = useMemo(() => {
		if (activeTab === CreateStep.ConfirmPassphraseStep) {
			return useEncryption && !acceptResponsibility;
		}
	}, [activeTab, acceptResponsibility, useEncryption]);

	return (
		<SidePanel
			title={title}
			subtitle={subtitle}
			titleIcon={titleIcon}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="CreateAddressSidePanel"
			onMountChange={onMountChange}
			hasSteps
			totalSteps={allSteps.length}
			activeStep={activeTab}
			disableBackButton={activeTab > CreateStep.WalletOverviewStep}
			footer={
				<SidePanelButtons data-testid="CreateAddressSidePanel__footer">
					{activeTab <= CreateStep.EncryptPasswordStep && (
						<>
							{activeTab < CreateStep.SuccessStep && activeTab !== CreateStep.WalletOverviewStep && (
								<Button
									data-testid="CreateWallet__back-button"
									disabled={isGeneratingWallet}
									variant="secondary"
									onClick={handleBack}
								>
									{t("COMMON.BACK")}
								</Button>
							)}

							{activeTab < CreateStep.EncryptPasswordStep && (
								<Button
									data-testid="CreateWallet__continue-button"
									disabled={isDirty ? !isValid || isGeneratingWallet || isNextDisabled : true}
									isLoading={isGeneratingWallet}
									onClick={() => handleNext()}
								>
									{t("COMMON.CONTINUE")}
								</Button>
							)}

							{activeTab === CreateStep.EncryptPasswordStep && (
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
						</>
					)}

					{activeTab === CreateStep.SuccessStep && (
						<Button
							disabled={isSubmitting}
							type="submit"
							form="CreateWallet__form"
							data-testid="CreateWallet__finish-button"
						>
							{t("COMMON.CLOSE")}
						</Button>
					)}
				</SidePanelButtons>
			}
		>
			<Form context={form} onSubmit={handleFinish} className="space-y-0" id="CreateWallet__form">
				<Tabs activeId={activeTab}>
					<div>
						<TabPanel tabId={CreateStep.WalletOverviewStep}>
							<WalletOverviewStep isGeneratingWallet={isGeneratingWallet} />
						</TabPanel>

						<TabPanel tabId={CreateStep.ConfirmPassphraseStep}>
							<ConfirmPassphraseStep />
						</TabPanel>

						<TabPanel tabId={CreateStep.EncryptPasswordStep}>
							<EncryptPasswordStep />
						</TabPanel>

						<TabPanel tabId={CreateStep.SuccessStep}>
							<SuccessStep onClickEditAlias={() => setIsEditAliasModalOpen(true)} />
						</TabPanel>
					</div>
				</Tabs>
			</Form>

			{renderUpdateWalletNameModal()}
		</SidePanel>
	);
};
