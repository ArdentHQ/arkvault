import { Contracts } from "@/app/lib/profiles";
import React, { useEffect, useMemo, useState, JSX, useRef } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { LedgerTabs } from "./Ledger/LedgerTabs";
import { ImportDetailStep } from "./ImportDetailStep";
import { SuccessStep } from "./SuccessStep";
import { Form } from "@/app/components/Form";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useEnvironmentContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks/env";
import { useKeydown } from "@/app/hooks/use-keydown";
import { toasts } from "@/app/services";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { UpdateWalletName } from "@/domains/wallet/components/UpdateWalletName";
import { useWalletImport, WalletGenerationInput } from "@/domains/wallet/hooks/use-wallet-import";
import { assertString, assertWallet } from "@/utils/assertions";
import { SidePanel } from "@/app/components/SidePanel/SidePanel";
import { MethodStep } from "@/domains/portfolio/components/ImportWallet/MethodStep";
import {
	ImportActionToolbar,
	ImportAddressStep,
	useLedgerStepHeaderConfig,
	useStepHeaderConfig,
} from "./ImportAddressSidePanel.blocks";
import { OptionsValue } from "@/domains/wallet/hooks";
import { LedgerTabStep } from "./Ledger/LedgerTabs.contracts";

export const ImportAddressesSidePanel = ({
	open,
	onOpenChange,
	onMountChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onMountChange?: (mounted: boolean) => void;
}): JSX.Element => {
	const navigate = useNavigate();
	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();
	const [activeTab, setActiveTab] = useState<ImportAddressStep>(ImportAddressStep.MethodStep);
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

	const { getValues, formState, register, watch } = form;
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

	const stepConfig = useStepHeaderConfig(activeTab, importOption);
	const ledgerConfig = useLedgerStepHeaderConfig(ledgerActiveTab, importOption);

	const config = isLedgerImport && activeTab === ImportAddressStep.ImportDetailStep ? ledgerConfig : stepConfig;

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

		if (!isLedgerImport && !isButton && !isNextDisabled && activeTab <= ImportAddressStep.EncryptPasswordStep) {
			handleNext();
		}
	});

	const forgetImportedWallets = (importedWallet?: Contracts.IReadWriteWallet) => {
		assertWallet(importedWallet);

		activeProfile.wallets().forget(importedWallet.id());

		if (activeProfile.wallets().selected().length === 0) {
			activeProfile.wallets().selectOne(activeProfile.wallets().first());
		}
	};

	const prevOpenRef = useRef(open);
	useEffect(() => {
		if (prevOpenRef.current && !open) {
			if (activeTab === ImportAddressStep.EncryptPasswordStep && importedWallet) {
				forgetImportedWallets(importedWallet);
			}

			setActiveTab(ImportAddressStep.MethodStep);
		}
		prevOpenRef.current = open;
	}, [open, activeTab, importedWallet]);

	const stepHistoryRef = useRef<ImportAddressStep[]>([]);
	const isHandlingBackRef = useRef(false);

	useEffect(() => {
		if (!open) {
			return;
		}

		const handlePopState = (event) => {
			if (isHandlingBackRef.current) {
				return;
			}

			if (stepHistoryRef.current.length > 0) {
				event.preventDefault();
				isHandlingBackRef.current = true;

				const previousStep = stepHistoryRef.current.pop()!;
				setActiveTab(previousStep);

				setTimeout(() => {
					isHandlingBackRef.current = false;
				}, 50);
			}
		};

		window.addEventListener("popstate", handlePopState);

		return () => {
			window.removeEventListener("popstate", handlePopState);
		};
	}, [open]);

	const prevActiveTabRef = useRef(activeTab);
	useEffect(() => {
		const prevTab = prevActiveTabRef.current;

		if (open && activeTab > prevTab && !isHandlingBackRef.current) {
			stepHistoryRef.current.push(prevTab);
			window.history.pushState({ sidePanelStep: activeTab }, "");
		}

		if (!open) {
			stepHistoryRef.current = [];
		}

		prevActiveTabRef.current = activeTab;
	}, [activeTab, open]);

	const handleNext = () =>
		({
			[ImportAddressStep.MethodStep]: async () => {
				setActiveTab(ImportAddressStep.ImportDetailStep);
			},
			[ImportAddressStep.ImportDetailStep]: async () => {
				setIsImporting(true);

				try {
					await importWallet();

					if (useEncryption && importOption.canBeEncrypted) {
						setActiveTab(ImportAddressStep.EncryptPasswordStep);
					} else {
						setActiveTab(ImportAddressStep.SummaryStep);
					}
				} catch (error) {
					/* istanbul ignore next -- @preserve */
					toasts.error(error.message);
				} finally {
					setIsImporting(false);
				}
			},
			[ImportAddressStep.EncryptPasswordStep]: async () => {
				setIsEncrypting(true);

				await encryptInputs();
				setActiveTab(ImportAddressStep.SummaryStep);

				setIsEncrypting(false);
			},
		})[activeTab as Exclude<ImportAddressStep, ImportAddressStep.SummaryStep>]();

	const handleBack = () => {
		if (activeTab === ImportAddressStep.MethodStep) {
			return navigate(`/profiles/${activeProfile.id()}/dashboard`);
		}

		if (activeTab === ImportAddressStep.EncryptPasswordStep && importedWallet) {
			forgetImportedWallets(importedWallet);
		}

		setActiveTab(activeTab - 1);
	};

	const importWallet = async () => {
		const { importOption, value } = getValues();
		const wallets = await importWallets({
			type: importOption.value,
			value,
		});

		setImportedWallet(wallets.at(0));
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
		if (activeTab === ImportAddressStep.ImportDetailStep && useEncryption) {
			return !isValid || !acceptResponsibility;
		}

		if (activeTab < ImportAddressStep.EncryptPasswordStep) {
			return isDirty ? !isValid || isImporting : true;
		}

		if (activeTab === ImportAddressStep.EncryptPasswordStep) {
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

	const isMethodStep = activeTab === ImportAddressStep.MethodStep;

	const getActiveStep = () => {
		if (isLedgerImport) {
			return ledgerActiveTab - 2;
		}
		if (!isMethodStep) {
			return activeTab - 1;
		}
		return 1;
	};

	return (
		<SidePanel
			title={config.title}
			subtitle={config.subtitle}
			titleIcon={config.titleIcon}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="ImportAddressSidePanel"
			onMountChange={onMountChange}
			hasSteps={!isMethodStep}
			totalSteps={allSteps.length}
			activeStep={getActiveStep()}
			disableBackButton={activeTab > ImportAddressStep.MethodStep}
			footer={
				!isLedgerImport && (
					<ImportActionToolbar
						showButtons={!isMethodStep && activeTab <= ImportAddressStep.EncryptPasswordStep}
						isBackDisabled={isImporting}
						onBack={handleBack}
						isContinueDisabled={isNextDisabled}
						onContinue={handleNext}
						isLoading={isEncrypting || isImporting}
						isSubmitDisabled={isSubmitting}
						showPortfoliobutton={activeTab === ImportAddressStep.SummaryStep}
						onSubmit={handleFinish}
					/>
				)
			}
		>
			<Form context={form} data-testid="ImportWallet__form">
				<Tabs activeId={activeTab}>
					<div>
						<TabPanel tabId={ImportAddressStep.MethodStep}>
							<MethodStep network={activeNetwork} onSelect={handleNext} />
						</TabPanel>

						<TabPanel tabId={ImportAddressStep.ImportDetailStep}>
							{isLedgerImport && (
								<LedgerTabs
									onClickEditWalletName={handleEditLedgerAlias}
									onStepChange={setLedgerActiveTab}
									onCancel={() => {
										onOpenChange(false);
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

						<TabPanel tabId={ImportAddressStep.EncryptPasswordStep}>
							<EncryptPasswordStep importedWallet={importedWallet} />
						</TabPanel>

						<TabPanel tabId={ImportAddressStep.SummaryStep}>
							{importedWallet && (
								<SuccessStep
									importedWallet={importedWallet}
									onClickEditAlias={() => setIsEditAliasModalOpen(true)}
								/>
							)}
						</TabPanel>
					</div>
				</Tabs>
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
