import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { LedgerTabs } from "./Ledger/LedgerTabs";
import { ImportDetailStep } from "./ImportDetailStep";
import { SuccessStep } from "./SuccessStep";
import { Button } from "@/app/components/Button";
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
import { Header } from "@/app/components/Header";
import { Icon, ThemeIcon } from "@/app/components/Icon";
import { MethodStep } from "@/domains/portfolio/components/ImportWallet/MethodStep";
import { ImportOption } from "@/domains/wallet/hooks";

enum Step {
	MethodStep = 1,
	ImportDetailStep = 2,
	EncryptPasswordStep,
	SummaryStep,
}

export const ImportAddressesSidePanel = ({
	open,
	onOpenChange,
}: {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}): JSX.Element => {
	const history = useHistory();
	const isLedgerImport = history.location.pathname.includes("/import/ledger");
	const activeProfile = useActiveProfile();
	const { persist } = useEnvironmentContext();
	const [activeTab, setActiveTab] = useState<Step>(Step.MethodStep);
	const [importedWallet, setImportedWallet] = useState<Contracts.IReadWriteWallet | undefined>(undefined);
	const [walletGenerationInput, setWalletGenerationInput] = useState<WalletGenerationInput>();

	const [isImporting, setIsImporting] = useState(false);
	const [isEncrypting, setIsEncrypting] = useState(false);
	const [isEditAliasModalOpen, setIsEditAliasModalOpen] = useState(false);

	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const { t } = useTranslation();
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const form = useForm<any>({
		mode: "onChange",
	});

	const { getValues, formState, register, watch } = form;
	const { isDirty, isSubmitting, isValid } = formState;
	const { value, importOption, encryptionPassword, confirmEncryptionPassword, secondInput, useEncryption } = watch();

	useEffect(() => {
		register({ name: "importOption", type: "custom" });
		register("useEncryption");
	}, [register]);

	useEffect(() => {
		if (open) {
			setActiveTab(Step.MethodStep);
			setWalletGenerationInput(undefined);
		}
	}, [open]);

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

		if (activeTab === Step.EncryptPasswordStep) {
			forgetImportedWallets(importedWallet);
		}

		setActiveTab(activeTab - 1);
	};

	const importWalletsInAllNetworks = async () => {
		const { importOption, encryptedWif, value } = getValues();
		const wallets = await importWallets({
			encryptedWif,
			networks: activeProfile.availableNetworks(),
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
		if (activeTab < Step.EncryptPasswordStep) {
			return isDirty ? !isValid || isImporting : true;
		}

		if (activeTab === Step.EncryptPasswordStep) {
			return isEncrypting || !isValid || !encryptionPassword || !confirmEncryptionPassword;
		}
	}, [activeTab, confirmEncryptionPassword, encryptionPassword, isDirty, isEncrypting, isImporting, isValid]);

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

	return (
		<SidePanel
			header={<StepHeader step={activeTab} importOption={importOption} />}
			open={open}
			onOpenChange={handleOpenChange}
			dataTestId="ImportAddressSidePanel"
		>
			<Form context={form} data-testid="ImportWallet__form">
				{isLedgerImport ? (
					<LedgerTabs onClickEditWalletName={handleEditLedgerAlias} />
				) : (
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
									<ImportDetailStep profile={activeProfile} network={activeNetwork} />
								</TabPanel>

								<TabPanel tabId={Step.EncryptPasswordStep}>
									<EncryptPasswordStep importedWallet={importedWallet} />
								</TabPanel>

								<TabPanel tabId={Step.SummaryStep}>
									<SuccessStep
										importedWallet={importedWallet}
										onClickEditAlias={() => setIsEditAliasModalOpen(true)}
									/>
								</TabPanel>
							</div>
						</Tabs>
						<div className="fixed inset-x-0 bottom-0 mr-[5px] flex items-center justify-end bg-theme-background p-2 px-4 sm:justify-between sm:px-6 sm:py-6 md:px-8">
							{!isMethodStep && (
								<div className="hidden w-[136px] sm:block">
									<StepIndicator steps={allSteps} activeIndex={activeTab} showTitle={false} />
								</div>
							)}

							<div className="flex w-full gap-3 sm:justify-end [&>button]:flex-1 sm:[&>button]:flex-none">
								{!isMethodStep && activeTab <= Step.EncryptPasswordStep && (
									<>
										<Button
											disabled={isImporting}
											variant="secondary"
											onClick={handleBack}
											data-testid="ImportWallet__back-button"
										>
											{t("COMMON.BACK")}
										</Button>

										<Button
											disabled={isNextDisabled}
											isLoading={isEncrypting || isImporting}
											onClick={handleNext}
											data-testid="ImportWallet__continue-button"
										>
											{t("COMMON.CONTINUE")}
										</Button>
									</>
								)}

								{activeTab === Step.SummaryStep && (
									<Button
										disabled={isSubmitting}
										onClick={handleFinish}
										data-testid="ImportWallet__finish-button"
									>
										{t("COMMON.GO_TO_PORTFOLIO")}
									</Button>
								)}
							</div>
						</div>
					</>
				)}
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

const StepHeader = ({ step, importOption }: { step: Step; importOption: ImportOption | undefined }): JSX.Element => {
	const { t } = useTranslation();

	const headers: Record<Step, JSX.Element> = {
		[Step.MethodStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.TITLE")}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.SUBTITLE")}
				className="mt-px"
			/>
		),
		[Step.ImportDetailStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={importOption?.header ?? ""}
				subtitle={importOption?.description ?? ""}
				titleIcon={
					importOption?.icon ? (
						<div className="text-theme-primary-600 dark:text-theme-navy-500"> {importOption.icon} </div>
					) : undefined
				}
				className="mt-px"
			/>
		),
		[Step.EncryptPasswordStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				title={t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE")}
				className="mt-px"
				titleIcon={
					<ThemeIcon
						lightIcon="WalletEncryptionLight"
						darkIcon="WalletEncryptionDark"
						dimensions={[24, 24]}
					/>
				}
			/>
		),
		[Step.SummaryStep]: (
			<Header
				titleClassName="text-lg md:text-2xl md:leading-[29px]"
				className="mt-px"
				title={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.TITLE")}
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name="Completed"
						data-testid="icon-Completed"
					/>
				}
				subtitle={t("WALLETS.PAGE_IMPORT_WALLET.SUCCESS_STEP.SUBTITLE")}
			/>
		),
	};

	return headers[step];
};
