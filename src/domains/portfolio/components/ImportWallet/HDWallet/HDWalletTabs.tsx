import React, { useCallback, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { TabPanel, Tabs } from "@/app/components/Tabs";
import { LedgerData } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { useWalletImport } from "@/domains/wallet/hooks";
import {
	HDWalletTabsProperties,
	HDWalletTabStep,
} from "@/domains/portfolio/components/ImportWallet/HDWallet/HDWalletsTabs.contracts";
import { ImportDetailStep } from "@/domains/portfolio/components/ImportWallet/ImportDetailStep";
import { ImportActionToolbar } from "@/domains/portfolio/components/ImportWallet/ImportAddressSidePanel.blocks";
import { SelectAddressStep } from "@/domains/portfolio/components/ImportWallet/HDWallet/SelectAddressStep";
import { EncryptPasswordStep } from "@/domains/wallet/components/EncryptPasswordStep";

export const HDWalletTabs = ({
	activeIndex = HDWalletTabStep.SelectWalletStep,
	onClickEditWalletName,
	onStepChange,
	onCancel,
	onSubmit,
	onBack,
}: HDWalletTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const navigate = useNavigate();

	const { formState, handleSubmit, getValues, register } = useFormContext();
	const { isValid, isSubmitting, isDirty } = formState;

	const isImporting = false;
	const isEncrypting = false;
	const { importOption, acceptResponsibility, useEncryption, encryptionPassword, confirmEncryptionPassword } =
		getValues();

	const [importedWallets, setImportedWallets] = useState<LedgerData[]>([]);
	const [activeTab, setActiveTab] = useState<HDWalletTabStep>(HDWalletTabStep.SelectWalletStep);

	const handleWalletImporting = useCallback(async ({ wallets }: { wallets: LedgerData[] }) => {}, []);

	const isNextDisabled = useMemo(() => {
		if (activeTab === HDWalletTabStep.EnterMnemonicStep && useEncryption) {
			return !isValid || !acceptResponsibility;
		}

		if (activeTab === HDWalletTabStep.EncryptPasswordStep) {
			return isEncrypting || !isValid || !encryptionPassword || !confirmEncryptionPassword;
		}

		return !isValid;
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

	useKeydown("Enter", (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#ledgerTabs") !== null || target.tagName === "BODY";

		// if (isComponentChild && !isNextDisabled && !isSubmitting) {
		// 	if (activeTab < HDWalletTabStep.SelectWalletStep) {
		// 		handleNext();
		// 	} else {
		// 		handleFinish();
		// 	}
		// }
	});

	const goToPreviousStep = useCallback(() => {
		setActiveTab((prev) => {
			const next = Math.max(HDWalletTabStep.SelectWalletStep, prev - 1);
			onStepChange?.(next);
			return next;
		});
	}, [onStepChange]);

	const handleNext = useCallback(() => {
		let next = activeTab + 1;

		if (activeTab === HDWalletTabStep.EnterMnemonicStep && (!useEncryption || !importOption.canBeEncrypted)) {
			next = activeTab + 2;
		}

		if ([HDWalletTabStep.SelectAddressStep, HDWalletTabStep.EncryptPasswordStep].includes(next)) {
			register({ name: "mnemonic", type: "string", value: getValues("value") });
		}

		setActiveTab(next);
		onStepChange?.(next);
	}, [activeTab, handleSubmit, importWallets, onStepChange]);

	const handleFinish = useCallback(() => {
		navigate(`/profiles/${activeProfile.id()}/dashboard`);
	}, [activeProfile, navigate]);

	const handleBack = useCallback(() => {
		if (activeTab !== HDWalletTabStep.SelectWalletStep) {
			const prev = activeTab - 1;
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
							<TabPanel tabId={HDWalletTabStep.SelectWalletStep}>
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

							<TabPanel tabId={HDWalletTabStep.ViewImportStep}>// import</TabPanel>
						</div>
					</div>
				</Tabs>
			</div>

			{/* Normal toolbar footer (no error) */}
			<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
				<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
					<ImportActionToolbar
						showButtons={true}
						onBack={handleBack}
						isContinueDisabled={isNextDisabled || isSubmitting}
						isLoading={isSubmitting}
						onContinue={handleNext}
						isSubmitDisabled={isSubmitting}
						showPortfoliobutton={activeTab === HDWalletTabStep.ViewImportStep}
						onSubmit={onSubmit}
					/>
				</div>
			</div>
		</>
	);
};
