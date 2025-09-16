import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useActiveProfile } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { OptionsValue, useWalletImport } from "@/domains/wallet/hooks";
import {
	AddressData,
	HDWalletTabsProperties,
	HDWalletTabStep,
} from "@/domains/portfolio/components/ImportWallet/HDWallet/HDWalletsTabs.contracts";
import { ImportDetailStep } from "@/domains/portfolio/components/ImportWallet/ImportDetailStep";
import { ImportActionToolbar } from "@/domains/portfolio/components/ImportWallet/ImportAddressSidePanel.blocks";
import { SelectAddressStep } from "@/domains/portfolio/components/ImportWallet/HDWallet/SelectAddressStep";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";
import { LedgerImportStep } from "@/domains/portfolio/components/ImportWallet/Ledger/LedgerImportStep";
import { WalletData, WalletImportMethod } from "@/app/lib/profiles/wallet.enum";
import { useEnvironmentContext } from "@/app/contexts";
import { SelectAccountStep } from "@/domains/portfolio/components/ImportWallet/HDWallet/SelectAccountStep";

export const HDWalletTabs = ({
	onClickEditWalletName,
	onStepChange,
	onCancel,
	onSubmit,
	onBack,
}: HDWalletTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const { persist } = useEnvironmentContext();

	const navigate = useNavigate();
	const [isImporting, setIsImporting] = useState(false);

	const existingHDWallets = useMemo(() => {
		return activeProfile.wallets().values()
			.filter((wallet) => wallet.isHDWallet())
			.map((wallet) => wallet.address());
	}, [activeProfile]);

	const hasExistingHDWallets = existingHDWallets.length > 0;

	const { formState, handleSubmit, getValues, register, unregister } = useFormContext();
	const { isValid, isSubmitting, isDirty } = formState;

	const {
		mnemonic,
		importOption,
		acceptResponsibility,
		useEncryption,
		encryptionPassword,
		confirmEncryptionPassword,
		password,
	} = getValues();

	console.log(getValues(["value", "mnemonic", "encryptionPassword", "password"]));

	const [importedWallets, setImportedWallets] = useState<AddressData[]>([]);
	const [activeTab, setActiveTab] = useState<HDWalletTabStep>(HDWalletTabStep.SelectAccountStep);

	const handleWalletImporting = useCallback(
		async ({ selectedAddresses }: { selectedAddresses: AddressData[] }) => {
			const addresses = selectedAddresses;

			await Promise.all(
				addresses.map(async ({ levels }, index) => {
					const wallets = await importWallets({
						disableAddressSelection: index !== 0, // set the very first address to be selected
						levels,
						type: OptionsValue.BIP44,
						value: mnemonic as string,
					});

					const wallet = wallets[0];

					if (password) {
						wallet.data().set(WalletData.ImportMethod, WalletImportMethod.BIP44.MNEMONIC_WITH_ENCRYPTION);
						await wallet.signingKey().set(mnemonic, password);
					}
				}),
			);

			await persist();
			setImportedWallets(addresses);
		},
		[activeProfile, importWallets, mnemonic, password],
	);

	const isNextDisabled = useMemo(() => {
		if (activeTab === HDWalletTabStep.EnterMnemonicStep && useEncryption) {
			return !isValid || !acceptResponsibility;
		}

		if (activeTab === HDWalletTabStep.EncryptPasswordStep) {
			return !isValid || !encryptionPassword || !confirmEncryptionPassword;
		}

		return !isValid;
	}, [
		activeTab,
		acceptResponsibility,
		useEncryption,
		confirmEncryptionPassword,
		encryptionPassword,
		isDirty,
		isImporting,
		isValid,
	]);

	useEffect(() => {
		if (!hasExistingHDWallets) {
			setActiveTab(HDWalletTabStep.EnterMnemonicStep);
		}
	}, [hasExistingHDWallets]);

	useKeydown("Enter", (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#HDWalletTabs") !== null || target.tagName === "BODY";

		if (isComponentChild && !isNextDisabled && !isSubmitting) {
			if (activeTab < HDWalletTabStep.SummaryStep) {
				handleNext();
			} else {
				navigate(`/profiles/${activeProfile.id()}/dashboard`);
			}
		}
	});

	const handleNext = useCallback(async () => {
		let next = activeTab + 1;

		if (activeTab === HDWalletTabStep.EnterMnemonicStep && (!useEncryption || !importOption.canBeEncrypted)) {
			next = activeTab + 2;
		}

		if ([HDWalletTabStep.EncryptPasswordStep, HDWalletTabStep.SelectAddressStep].includes(next)) {
			const { value, encryptionPassword } = getValues();

			if (value) {
				register({ name: "mnemonic", type: "string", value });
			}

			if (encryptionPassword) {
				register({ name: "password", type: "string", value: encryptionPassword });
			}
		}

		if (activeTab === HDWalletTabStep.SelectAddressStep) {
			setIsImporting(true);
			await handleSubmit((data: any) => handleWalletImporting(data))();

			setIsImporting(false);
		}

		setActiveTab(next);
		onStepChange?.(next);

		return () => {
			unregister(["mnemonic", "password"]);
		};
	}, [activeTab, handleSubmit, importWallets, onStepChange]);

	const handleBack = useCallback(() => {
		if (activeTab !== HDWalletTabStep.SelectAccountStep) {
			let prev = activeTab - 1;

			if (activeTab === HDWalletTabStep.SelectAddressStep && !useEncryption) {
				prev--;
			}

			if (prev === HDWalletTabStep.SelectAccountStep && !hasExistingHDWallets) {
				onBack?.();
				return;
			}

			setActiveTab(prev);
			onStepChange?.(prev);
			return;
		}

		if (onBack) {
			return onBack();
		}

		return onCancel?.();
	}, [activeTab, onBack, onCancel, onStepChange]);

	return (
		<>
			<div className="h-full pb-20">
				<Tabs id="HDWalletTabs" activeId={activeTab}>
					<div data-testid="HDWalletTabs--child" className="h-full">
						<div className="h-full">
							<TabPanel tabId={HDWalletTabStep.SelectAccountStep}>
								<SelectAccountStep network={activeNetwork} profile={activeProfile} />
							</TabPanel>

							<TabPanel tabId={HDWalletTabStep.EnterMnemonicStep}>
								<ImportDetailStep
									profile={activeProfile}
									network={activeNetwork}
									importOption={importOption}
								/>
							</TabPanel>

							<TabPanel tabId={HDWalletTabStep.EncryptPasswordStep}>
								<EncryptPasswordStep />
							</TabPanel>

							<TabPanel tabId={HDWalletTabStep.SelectAddressStep}>
								<SelectAddressStep network={activeNetwork} profile={activeProfile} />
							</TabPanel>

							<TabPanel tabId={HDWalletTabStep.SummaryStep}>
								<LedgerImportStep
									network={activeNetwork}
									wallets={importedWallets}
									profile={activeProfile}
									onClickEditWalletName={onClickEditWalletName}
								/>
							</TabPanel>
						</div>
					</div>
				</Tabs>
			</div>

			{/* Normal toolbar footer (no error) */}
			<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
				<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
					<ImportActionToolbar
						showButtons={activeTab < HDWalletTabStep.SummaryStep}
						onBack={handleBack}
						isContinueDisabled={isNextDisabled || isSubmitting}
						isLoading={isSubmitting}
						onContinue={handleNext}
						isSubmitDisabled={isSubmitting}
						showPortfoliobutton={activeTab === HDWalletTabStep.SummaryStep}
						onSubmit={onSubmit}
					/>
				</div>
			</div>
		</>
	);
};
