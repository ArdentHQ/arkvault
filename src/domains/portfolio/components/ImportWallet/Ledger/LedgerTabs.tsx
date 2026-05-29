import React, { useCallback, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";

import { LedgerConnectionStep } from "./LedgerConnectionStep";
import { LedgerImportStep } from "./LedgerImportStep";
import { LedgerScanStep } from "./LedgerScanStep";
import { LedgerTabsProperties, LedgerTabStep } from "./LedgerTabs.contracts";
import {
	useLedgerTabsGoToPrev,
	useLedgerTabsHandleNext,
	useLedgerTabsHandleRetry,
	useLedgerTabsHandleFinish,
	useLedgerTabsHandleDeviceNotAvailable,
	useLedgerTabsHandleBack,
	useHandleWalletImporting,
	useOnConnect,
	useCancel,
	useOnFailed,
	useEnterHandler,
	LedgerTabsFooter,
} from "./LedgerTabs.blocks";
import { ListenLedger } from "@/domains/transaction/components/AuthenticationStep/Ledger/ListenLedger";
import { TabPanel, Tabs } from "@/app/components/Tabs";
import { useLedgerContext } from "@/app/contexts";
import { useActiveProfile } from "@/app/hooks";
import { useKeydown } from "@/app/hooks/use-keydown";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const LedgerTabs = ({
	activeIndex = LedgerTabStep.ListenLedgerStep,
	onClickEditWalletName,
	onStepChange,
	onCancel,
	onSubmit,
	onBack,
}: LedgerTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const { isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected, listenDevice } =
		useLedgerContext();

	const { formState, handleSubmit } = useFormContext();
	const { isValid, isSubmitting } = formState;

	const { handleWalletImporting, importedWallets } = useHandleWalletImporting({
		listenDevice,
		profile: activeProfile,
	});

	const { activeTab, showRetry, setActiveTab, setShowRetry, goToPreviousStep } = useLedgerTabsGoToPrev({
		activeIndex,
		onStepChange,
	});
	const [cancelling, setCancelling] = useState(false);

	const { onConnect } = useOnConnect({
		onStepChange,
		setActiveTab,
		setShowRetry,
	});

	const retryFunctionReference = useRef<(() => void) | undefined>(undefined);

	const { handleNext } = useLedgerTabsHandleNext(
		{
			activeTab,
			handleWalletImporting,
			onStepChange,
			setActiveTab,
			setShowRetry,
			showRetry,
		},
		handleSubmit,
	);

	const isNextDisabled = useMemo(() => isBusy || !isValid, [isBusy, isValid]);

	useCancel({
		cancelling,
		disconnect,
		isAwaitingConnection,
		isAwaitingDeviceConfirmation,
		isBusy,
		isConnected,
		setCancelling,
	});

	const registerRetry = useCallback((callback?: () => void) => {
		retryFunctionReference.current = callback;
		setShowRetry(!!callback);
	}, []);

	const { onFailed } = useOnFailed({
		goToPreviousStep,
		registerRetry,
		setShowRetry,
	});

	const { handleRetry } = useLedgerTabsHandleRetry({
		goToPreviousStep,
		retryFunctionReference,
	});

	const { handleFinish } = useLedgerTabsHandleFinish({
		activeProfileId: activeProfile.id(),
	});

	const { handleEnter } = useEnterHandler({
		activeTab,
		isNextDisabled,
		isSubmitting,
		onHandleFinish: handleFinish,
		onHandleNext: handleNext,
	});

	useKeydown("Enter", handleEnter);

	const { handleDeviceNotAvailable } = useLedgerTabsHandleDeviceNotAvailable({
		activeProfileId: activeProfile.id(),
	});

	const { handleBack } = useLedgerTabsHandleBack({
		activeTab,
		onBack,
		onCancel,
		onStepChange,
		setActiveTab,
		setShowRetry,
	});

	const showFooter = showRetry || [LedgerTabStep.LedgerScanStep, LedgerTabStep.LedgerImportStep].includes(activeTab);

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
										setShowRetry(false);
										setActiveTab(LedgerTabStep.LedgerConnectionStep);
										onStepChange?.(LedgerTabStep.LedgerConnectionStep);
									}}
									onDeviceNotAvailable={handleDeviceNotAvailable}
								/>
							</TabPanel>

							<TabPanel tabId={LedgerTabStep.LedgerConnectionStep}>
								<LedgerConnectionStep
									cancelling={cancelling}
									onConnect={onConnect}
									onFailed={onFailed}
									network={activeNetwork}
								/>
							</TabPanel>

							<TabPanel tabId={LedgerTabStep.LedgerScanStep}>
								<LedgerScanStep
									cancelling={cancelling}
									profile={activeProfile}
									setRetryFn={registerRetry}
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

			<LedgerTabsFooter
				showFooter={showFooter}
				showRetry={showRetry}
				activeTab={activeTab}
				onBack={handleBack}
				onContinue={handleNext}
				handleRetry={handleRetry}
				isContinueDisabled={isNextDisabled || isSubmitting}
				isLoading={isSubmitting}
				isSubmitDisabled={isSubmitting}
				onSubmit={onSubmit}
			/>
		</>
	);
};
