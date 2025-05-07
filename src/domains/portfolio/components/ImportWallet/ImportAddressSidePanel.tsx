import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { LedgerTabs } from "./Ledger/LedgerTabs";
import { ImportDetailStep } from "./ImportDetailStep";
import { SuccessStep } from "./SuccessStep";
import { Form } from "@/app/components/Form";
import { StepIndicator } from "@/app/components/StepIndicator";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks/env";
import { useKeydown } from "@/app/hooks/use-keydown";
import { toasts } from "@/app/services";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { useWalletImport, WalletGenerationInput } from "@/domains/wallet/hooks/use-wallet-import";
import { assertString, assertWallet } from "@/utils/assertions";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { MethodStep } from "@/domains/portfolio/components/ImportWallet/MethodStep";
import { ImportActionToolbar, LedgerStepHeader, StepHeader } from "./ImportAddressSidePanel.blocks";
import { OptionsValue } from "@/domains/wallet/hooks";
import { LedgerTabStep } from "./Ledger/LedgerTabs.contracts";

enum Step {
	MethodStep = 1,
	ImportDetailStep = 2,
	EncryptPasswordStep,
	SummaryStep,
}

export const ImportAddressesSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const history = useHistory();
	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();
	const [activeTab, setActiveTab] = useState<Step>(Step.MethodStep);
	const [ledgerActiveTab, setLedgerActiveTab] = useState<LedgerTabStep>(LedgerTabStep.ListenLedgerStep);
	const [importedWallet, setImportedWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);
	const [walletGenerationInput, setWalletGenerationInput] = useState<WalletGenerationInput>();

	const [isImporting, setIsImporting] = useState(false);
	const [isEncrypting, setIsEncrypting] = useState(false);
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);

	const activeNetwork = activeProfile.activeNetwork();

	const { t } = useTranslation();
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const form = useForm<any>({
		mode: "onChange",
	});

	const { getValues, formState, register, watch, errors  } = form;
	const { isDirty, isSubmitting, isValid } = formState;
	const {
		value,
		importOption,
		encryptionPassword,
		confirmEncryptionPassword,
		secondInput,
		useEncryption,
		acceptResponsibility,
	} = watch();
	const isLedgerImport = !!importOption && importOption.value === OptionsValue.LEDGER;

	useEffect(() => {
		register({ name: "importOption", type: "custom" });
		register({ name: "useEncryption", type: "boolean", value: false });
		register({ name: "acceptResponsibility", type: "boolean", value: false });
	}, [register]);

	useEffect(() => {
		if (value !== undefined) {
			setWalletGenerationInput(value);
		}
	}, [value, setWalletGenerationInput]);

	useKeydown("Enter", () => {
		const isButton = (document.activeElement as any)?.type === "button";

		if (!isLedgerImport && !isButton && !isNextDisabled && activeTab <= Step.EncryptPasswordStep) {
			handleNext();
		}
	});

	const forgetImportedWallets = (importedWallet?: Contracts.IReadWriteWallet) => {
		assertWallet(importedWallet);

		for (const profileWallet of activeProfile.wallets().values()) {
			if (profileWallet.address() === importedWallet.address()) {
				activeProfile.wallets().forget(profileWallet.id());
			}
		}
	};

	const handleOpenChange = (open: boolean) => {
		// remove added wallets if side panel is closed early
		if (!open && activeTab !== Step.SummaryStep && importedWallet) {
			forgetImportedWallets(importedWallet);
		}
		onOpenChange(open);
	};

	const handleNext = () =>
		({
			// eslint-disable-next-line @typescript-eslint/require-await
			[Step.MethodStep]: async () => {
				setActiveTab(Step.ImportDetailStep);
			},
			[Step.ImportDetailStep]: async () => {
				setIsImporting(true);

				try {
					await importWalletsInAllNetworks();

					if (useEncryption && importOption.canBeEncrypted) {
						setActiveTab(Step.EncryptPasswordStep);
					} else {
						setActiveTab(Step.SummaryStep);
					}
				} catch (error) {
					/* istanbul ignore next -- @preserve */
					toasts.error(error.message);
				} finally {
					setIsImporting(false);
				}
			},
			[Step.EncryptPasswordStep]: async () => {
				setIsEncrypting(true);

				await encryptInputs();
				setActiveTab(Step.SummaryStep);

				setIsEncrypting(false);
			},
		})[activeTab as Exclude<Step, Step.SummaryStep>]();

	const handleBack = () => {
		if (activeTab === Step.MethodStep) {
			return history.push(`/profiles/${activeProfile.id()}/dashboard`);
		}

		if (activeTab === Step.EncryptPasswordStep && importedWallet) {
			forgetImportedWallets(importedWallet);
		}

		setActiveTab(activeTab - 1);
	};

	const importWalletsInAllNetworks = async () => {
		const { importOption, encryptedWif, value } = getValues();
		const wallets = await importWallets({
			encryptedWif,
			type: importOption.value,
			value,
		});

		const currentWallet = wallets.find((wallet) => wallet.network().id() === activeNetwork.id());
		setImportedWallet(currentWallet);
	};

	const encryptInputs = async () => {
		assertWallet(importedWallet);
		assertString(walletGenerationInput);

		await importedWallet.signingKey().set(walletGenerationInput, encryptionPassword);

		if (secondInput) {
			await importedWallet.confirmKey().set(secondInput, encryptionPassword);
		}

		if (importedWallet.actsWithMnemonic()) {
			importedWallet
				.data()
				.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);
		}

		if (importedWallet.actsWithSecret()) {
			importedWallet
				.data()
				.set(Contracts.WalletData.ImportMethod, Contracts.WalletImportMethod.SECRET_WITH_ENCRYPTION);
		}

		await persist();
	};

	/* istanbul ignore next -- @preserve */
	const handleEditLedgerAlias = (wallet: Contracts.IReadWriteWallet) => {
		setImportedWallet(wallet);
		setIsEditAliasModalOpen(true);
	};

	const handleFinish = () => {
		onOpenChange(false);
	};

	const isNextDisabled = useMemo(() => {
		if (activeTab === Step.ImportDetailStep && useEncryption) {
			return !isValid || !acceptResponsibility;
		}

		if (activeTab < Step.EncryptPasswordStep) {
			return isDirty ? !isValid || isImporting : true;
		}

		if (activeTab === Step.EncryptPasswordStep) {
			return isEncrypting || !isValid || !encryptionPassword || !confirmEncryptionPassword;
		}
	}, [
		activeTab,
		acceptResponsibility,
		useEncryption,
		confirmEncryptionPassword,
		encryptionPassword,
		isDirty,
		isEncrypting,
		isImporting,
		isValid,
	]);

	const allSteps = useMemo(() => {
		const steps: string[] = [];

		steps.push(t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE"));

		if (useEncryption) {
			steps.push(t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE"));
		}

		steps.push(t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE"));

		return steps;
	}, [useEncryption, activeTab]);

	const isMethodStep = activeTab === Step.MethodStep;

	const StepsHeaderComponent = () => {
		if (activeTab === Step.ImportDetailStep && isLedgerImport) {
			return <LedgerStepHeader step={ledgerActiveTab} importOption={importOption} />;
		}

		return <StepHeader step={activeTab} importOption={importOption} />;
	};

	return (
		<SidePanel
			header={StepsHeaderComponent()}
			open={open}
			onOpenChange={handleOpenChange}
			dataTestId="ImportAddressSidePanel"
			onMountChange={onMountChange}
		>
			<Form context={form} data-testid="ImportWallet__form">
				<>
					<Tabs activeId={activeTab} className="pb-20">
						{!isMethodStep && (
							<div className="mb-4 sm:hidden">
								<StepIndicator steps={allSteps} activeIndex={activeTab} showTitle={false} />
							</div>
						)}

						<div>
							<TabPanel tabId={Step.MethodStep}>
								<MethodStep network={activeNetwork} onSelect={handleNext} />
							</TabPanel>

							<TabPanel tabId={Step.ImportDetailStep}>
								{isLedgerImport && (
									<LedgerTabs
										onClickEditWalletName={handleEditLedgerAlias}
										onStepChange={setLedgerActiveTab}
										onCancel={() => {
											handleOpenChange(false);
										}}
										onSubmit={handleFinish}
									/>
								)}
								{!isLedgerImport && importOption && (
									<ImportDetailStep
										profile={activeProfile}
										network={activeNetwork}
										importOption={importOption}
									/>
								)}
							</TabPanel>

							<TabPanel tabId={Step.EncryptPasswordStep}>
								<EncryptPasswordStep importedWallet={importedWallet} />
							</TabPanel>

							<TabPanel tabId={Step.SummaryStep}>
								{importedWallet && (
									<SuccessStep
										importedWallet={importedWallet}
										onClickEditAlias={() => setIsEditAliasModalOpen(true)}
									/>
								)}
							</TabPanel>
						</div>
					</Tabs>

					{!isLedgerImport && (
						<ImportActionToolbar
							showSteps={!isMethodStep}
							showButtons={!isMethodStep && activeTab <= Step.EncryptPasswordStep}
							isBackDisabled={isImporting}
							onBack={handleBack}
							isContinueDisabled={isNextDisabled}
							onContinue={handleNext}
							allSteps={allSteps}
							activeTab={activeTab}
							isLoading={isEncrypting || isImporting}
							isSubmitDisabled={isSubmitting}
							showPortfoliobutton={activeTab === Step.SummaryStep}
							onSubmit={handleFinish}
						/>
					)}
				</>
			</Form>

			{!!importedWallet && isEditAliasModalOpen && (
				<UpdateWalletName
					wallet={importedWallet}
					profile={activeProfile}
					onCancel={() => setIsEditAliasModalOpen(false)}
					onAfterSave={() => setIsEditAliasModalOpen(false)}
				/>
			)}
		</SidePanel>
	);
};
