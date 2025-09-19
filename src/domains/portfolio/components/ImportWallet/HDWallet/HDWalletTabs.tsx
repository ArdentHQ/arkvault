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

export const HDWalletTabs = ({
	onClickEditWalletName,
	onStepChange,
	onCancel,
	onSubmit,
	onBack,
	activeIndex,
}: HDWalletTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const { persist } = useEnvironmentContext();

	const navigate = useNavigate();
	const [isImporting, setIsImporting] = useState(false);

	const existingHDWallets = useMemo(
		() =>
			activeProfile
				.wallets()
				.values()
				.filter((wallet) => wallet.isHDWallet())
				.map((wallet) => wallet.address()),
		[activeProfile],
	);

	const hasExistingHDWallets = existingHDWallets.length > 0;

	const { formState, handleSubmit, getValues, register, unregister } = useFormContext();
	const { isValid, isSubmitting, isDirty, errors } = formState;

	const {
		mnemonic,
		importOption,
		acceptResponsibility,
		useEncryption,
		encryptionPassword,
		confirmEncryptionPassword,
		password,
	} = getValues();

	const [importedWallets, setImportedWallets] = useState<AddressData[]>([]);
	const firstStep = activeIndex ?? HDWalletTabStep.SelectAccountStep
	const [activeTab, setActiveTab] = useState<HDWalletTabStep>(firstStep);

	const handleWalletImporting = useCallback(
		async ({ selectedAddresses }: { selectedAddresses: AddressData[] }) => {
			const addresses = selectedAddresses.toSorted((a, b) => a.levels.addressIndex! - b.levels.addressIndex!);

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
		if (!hasExistingHDWallets && !activeIndex) {
			setActiveTab(HDWalletTabStep.EnterMnemonicStep);
		}

		return () => {
			unregister(["mnemonic", "password"]);
		};
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

	const handleNext = () =>
		({
			[HDWalletTabStep.SelectAccountStep]: async () => {
				// select enter mnemonic step when Import new HD wallet option selected
				// or there are no existing HD wallets
				setActiveTab(HDWalletTabStep.EnterMnemonicStep);
				onStepChange?.(HDWalletTabStep.EnterMnemonicStep);
			},
			[HDWalletTabStep.EnterMnemonicStep]: async () => {
				const { value } = getValues();

				if (value) {
					register({ name: "mnemonic", type: "string", value });
				}

				setActiveTab(useEncryption ? HDWalletTabStep.EncryptPasswordStep : HDWalletTabStep.SelectAddressStep);
			},
			[HDWalletTabStep.EncryptPasswordStep]: async () => {
				const { encryptionPassword } = getValues();
				if (encryptionPassword) {
					register({ name: "password", type: "string", value: encryptionPassword });
				}

				setActiveTab(HDWalletTabStep.SelectAddressStep);
			},
			[HDWalletTabStep.SelectAddressStep]: async () => {
				setIsImporting(true);
				await handleSubmit((data: any) => handleWalletImporting(data))();

				setIsImporting(false);
				setActiveTab(HDWalletTabStep.SummaryStep);
			},
		})[activeTab as Exclude<HDWalletTabStep, HDWalletTabStep.SummaryStep>]();

	// sync active back to parent
	useEffect(() => {
		onStepChange?.(activeTab);
	}, [activeTab]);

	const handleBack = useCallback(() => {
		if (activeTab !== HDWalletTabStep.SelectAccountStep) {
			let prev = activeTab - 1;

			if (activeTab === activeIndex) {
				onBack?.()
				return
			}

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
								// select or import new HD wallet
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
