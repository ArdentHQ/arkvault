import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { generatePath } from "react-router";
import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { LedgerImportStep } from "./LedgerImportStep";
import { LedgerScanStep } from "./LedgerScanStep";
import { LedgerTabsProperties, LedgerTabStep } from "./LedgerTabs.contracts";
import { ListenLedger } from "@/domains/transaction/components/AuthenticationStep/Ledger/ListenLedger";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { LedgerData, useLedgerContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { assertString } from "@/utils/assertions";
import { ProfilePaths } from "@/router/paths";
import { useActiveNetwork } from "@/app/hooks/use-active-network";
import { ImportActionToolbar } from "@/domains/portfolio/components/ImportWallet/ImportAddressSidePanel.blocks";
import { OptionsValue, useWalletImport } from "@/domains/wallet/hooks";

export const LedgerTabs = ({
	activeIndex = LedgerTabStep.ListenLedgerStep,
	onClickEditWalletName,
	onStepChange,
	onCancel,
	onSubmit,
}: LedgerTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallets } = useWalletImport({ profile: activeProfile });

	const navigate = useNavigate();
	const { isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected, listenDevice } =
		useLedgerContext();

	const { formState, handleSubmit } = useFormContext();
	const { isValid, isSubmitting } = formState;

	const [importedWallets, setImportedWallets] = useState<LedgerData[]>([]);
	const [activeTab, setActiveTab] = useState<number>(activeIndex);

	const isMultiple = useMemo(() => importedWallets.length > 1, [importedWallets]);

	const [_, setShowRetry] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const retryFunctionReference = useRef<() => void>(undefined);

	const handleWalletImporting = useCallback(
		async ({ wallets }: { wallets: LedgerData[] }) => {
			const device = await listenDevice();
			const deviceId = device?.id;
			assertString(deviceId);

			await Promise.all(
				wallets.map(({ path, address }, index) =>
					importWallets({
						ledgerOptions: {
							deviceId,
							path,
						},
						setSelected: index === 0,
						type: OptionsValue.LEDGER,
						value: address,
					}),
				),
			);

			setImportedWallets(wallets);
		},
		[activeProfile, activeNetwork, listenDevice],
	);

	const isNextDisabled = useMemo(() => isBusy || !isValid, [isBusy, isValid]);

	useKeydown("Enter", (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#ledgerTabs") !== null || target.tagName === "BODY";

		if (isComponentChild && !isNextDisabled && !isSubmitting) {
			if (activeTab < LedgerTabStep.LedgerImportStep) {
				handleNext();
			} else {
				handleFinish();
			}
		}
	});

	const handleNext = useCallback(async () => {
		if (activeTab === LedgerTabStep.LedgerScanStep) {
			await handleSubmit((data: any) => handleWalletImporting(data))();
		}

		setActiveTab(activeTab + 1);
		onStepChange?.(activeTab + 1);
	}, [activeTab, handleSubmit, handleWalletImporting]);

	useEffect(() => {
		const cancel = async () => {
			await disconnect();
		};

		if (cancelling && !isBusy) {
			setCancelling(false);

			cancel();
		}
	}, [cancelling, isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected]);

	const handleRetry = useCallback(
		(callback?: () => void) => {
			retryFunctionReference.current = callback;
			setShowRetry(!!callback);
		},
		[retryFunctionReference, setShowRetry],
	);

	const handleFinish = useCallback(() => {
		navigate(`/profiles/${activeProfile.id()}/dashboard`);
	}, [isMultiple, history, activeProfile, activeNetwork, importedWallets]);

	const handleDeviceNotAvailable = useCallback(() => {
		navigate(generatePath(ProfilePaths.Dashboard, { profileId: activeProfile.id() }));
	}, [history, activeProfile]);

	const handleBack = useCallback(() => {
		onCancel?.();
	}, [activeTab, history, listenDevice]);

	const showFooter = [LedgerTabStep.LedgerScanStep, LedgerTabStep.LedgerImportStep].includes(activeTab);

	return (
		<>
			<div className={showFooter ? "h-full pb-20" : "h-full"}>
				<Tabs id="ledgerTabs" activeId={activeTab}>
					<div data-testid="LedgerTabs" className="h-full">
						<div className="h-full overflow-y-auto">
							<TabPanel tabId={LedgerTabStep.ListenLedgerStep}>
								<ListenLedger
									noHeading
									onDeviceAvailable={() => {
										setActiveTab(LedgerTabStep.LedgerConnectionStep);
										onStepChange?.(LedgerTabStep.LedgerConnectionStep);
									}}
									onDeviceNotAvailable={handleDeviceNotAvailable}
								/>
							</TabPanel>

							<TabPanel tabId={LedgerTabStep.LedgerConnectionStep}>
								<LedgerConnectionStep
									cancelling={cancelling}
									onConnect={() => {
										setActiveTab(LedgerTabStep.LedgerScanStep);
										onStepChange?.(LedgerTabStep.LedgerScanStep);
									}}
									network={activeNetwork}
								/>
							</TabPanel>

							<TabPanel tabId={LedgerTabStep.LedgerScanStep}>
								<LedgerScanStep
									cancelling={cancelling}
									profile={activeProfile}
									setRetryFn={handleRetry}
									network={activeNetwork}
								/>
							</TabPanel>

							<TabPanel tabId={LedgerTabStep.LedgerImportStep}>
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

			{showFooter && (
				<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
					<ImportActionToolbar
						showButtons={activeTab !== LedgerTabStep.LedgerImportStep}
						onBack={handleBack}
						isContinueDisabled={isNextDisabled || isSubmitting}
						isLoading={isSubmitting}
						onContinue={handleNext}
						isSubmitDisabled={isSubmitting}
						showPortfoliobutton={activeTab === LedgerTabStep.LedgerImportStep}
						onSubmit={onSubmit}
					/>
				</div>
			)}
		</>
	);
};
