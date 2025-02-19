import { Contracts } from "@ardenthq/sdk-profiles";
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";

import { LedgerTabs } from "./Ledger/LedgerTabs";
import { MethodStep } from "./MethodStep";
import { SuccessStep } from "./SuccessStep";
import { Button } from "@/app/components/Button";
import { Form, FormButtons } from "@/app/components/Form";
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

enum Step {
	MethodStep = 1,
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

	const handleNext = () =>
		({
			[Step.MethodStep]: async () => {
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
			assertWallet(importedWallet);
			activeProfile.wallets().forget(importedWallet.id());
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

		importedWallet.signingKey().set(walletGenerationInput, encryptionPassword);

		if (secondInput) {
			importedWallet.confirmKey().set(secondInput, encryptionPassword);
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
		assertWallet(importedWallet);

		history.push(`/profiles/${activeProfile.id()}/dashboard`);
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


	return (
		<SidePanel
			header={<StepHeader step={activeTab} />}
			open={open}
			onOpenChange={onOpenChange}
			dataTestId="CreateAddressSidePanel"
		>
			<Form
				className="mx-auto max-w-xl"
				context={form}
				onSubmit={handleFinish}
				data-testid="ImportWallet__form"
			>
				{isLedgerImport ? (
					<LedgerTabs onClickEditWalletName={handleEditLedgerAlias} />
				) : (
					<Tabs activeId={activeTab}>
						<StepIndicator steps={allSteps} activeIndex={activeTab} />

						<div className="mt-8">
							<TabPanel tabId={Step.MethodStep}>
								<MethodStep profile={activeProfile} network={activeNetwork} />
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

							{activeTab <= Step.EncryptPasswordStep && (
								<FormButtons>
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
								</FormButtons>
							)}

							{activeTab === Step.SummaryStep && (
								<FormButtons>
									<Button
										disabled={isSubmitting}
										type="submit"
										data-testid="ImportWallet__finish-button"
									>
										{t("COMMON.GO_TO_WALLET")}
									</Button>
								</FormButtons>
							)}
						</div>
					</Tabs>
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

const StepHeader = ({ step }: { step: Step }): JSX.Element => {
	const { t } = useTranslation();

	return <div className="mx-auto max-w-xl">salam</div>
	// const headers: Record<Step, JSX.Element> = {
	// 	[Step.WalletOverviewStep]: (
	// 		<Header
	// 			title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_STEP.TITLE")}
	// 			titleClassName="text-lg md:text-2xl md:leading-[29px]"
	// 			titleIcon={
	// 				<ThemeIcon darkIcon="YourPassphraseDark" lightIcon="YourPassphraseLight" dimensions={[24, 24]} />
	// 			}
	// 			className="mt-px"
	// 		/>
	// 	),
	// 	[Step.ConfirmPassphraseStep]: (
	// 		<Header
	// 			titleClassName="text-lg md:text-2xl md:leading-[29px]"
	// 			title={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.TITLE")}
	// 			titleIcon={
	// 				<Icon name="ConfirmYourPassphrase" dimensions={[24, 24]} className="text-theme-primary-600" />
	// 			}
	// 			subtitle={t("WALLETS.PAGE_CREATE_WALLET.PASSPHRASE_CONFIRMATION_STEP.SUBTITLE")}
	// 			className="mt-px"
	// 		/>
	// 	),
	// 	[Step.EncryptPasswordStep]: (
	// 		<Header
	// 			titleClassName="text-lg md:text-2xl md:leading-[29px]"
	// 			title={t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE")}
	// 			className="mt-px"
	// 			titleIcon={
	// 				<ThemeIcon
	// 					lightIcon="WalletEncryptionLight"
	// 					darkIcon="WalletEncryptionDark"
	// 					dimensions={[24, 24]}
	// 				/>
	// 			}
	// 		/>
	// 	),
	// 	[Step.SuccessStep]: (
	// 		<Header
	// 			titleClassName="text-lg md:text-2xl md:leading-[29px]"
	// 			title={t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.TITLE")}
	// 			titleIcon={
	// 				<Icon
	// 					className="text-theme-success-100 dark:text-theme-success-900"
	// 					dimensions={[24, 24]}
	// 					name="Completed"
	// 					data-testid="icon-Completed"
	// 				/>
	// 			}
	// 			subtitle={t("WALLETS.PAGE_CREATE_WALLET.PROCESS_COMPLETED_STEP.SUBTITLE")}
	// 			className="mt-px"
	// 		/>
	// 	),
	// };
	//
	// return headers[step];
};
