import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useHistory } from "react-router-dom";

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
import { usePortfolio } from "@/domains/portfolio/hooks/use-portfolio";

export const LedgerTabs = ({
	activeIndex = LedgerTabStep.ListenLedgerStep,
	onClickEditWalletName,
	onStepChange,
	onCancel,
}: LedgerTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });
	const { importWallet } = useWalletImport({ profile: activeProfile });

	const history = useHistory();
	const { isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected, listenDevice } =
		useLedgerContext();

	const { formState, handleSubmit } = useFormContext();
	const { isValid, isSubmitting } = formState;
	const { setSelectedAddresses, selectedAddresses } = usePortfolio({ profile: activeProfile });

	const [importedWallets, setImportedWallets] = useState<LedgerData[]>([]);
	const [activeTab, setActiveTab] = useState<number>(activeIndex);

	const isMultiple = useMemo(() => importedWallets.length > 1, [importedWallets]);

	const [_, setShowRetry] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const retryFunctionReference = useRef<() => void>();

	const importWallets = useCallback(
		async ({ wallets }: any) => {
			const device = await listenDevice();
			const deviceId = device?.id;
			assertString(deviceId);

			setImportedWallets(wallets);

			for (const network of activeProfile.availableNetworks()) {
				const importedWallets = await Promise.all(
					wallets.map(({ path, address }) =>
						importWallet({
							ledgerOptions: {
								deviceId,
								path,
							},
							network,
							type: OptionsValue.LEDGER,
							value: address,
						}),
					),
				);

				console.log({ importedWallets: importedWallets.map((wallet) => wallet.address()), selectedAddresses });
				await setSelectedAddresses(
					[...selectedAddresses, ...importedWallets.map((wallet) => wallet.address())],
					network,
				);
			}
		},
		[activeProfile, activeNetwork, selectedAddresses],
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
			await handleSubmit((data: any) => importWallets(data))();
		}

		setActiveTab(activeTab + 1);
		onStepChange?.(activeTab + 1);
	}, [activeTab, handleSubmit, importWallets]);

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
		history.push(`/profiles/${activeProfile.id()}/dashboard`);
	}, [isMultiple, history, activeProfile, activeNetwork, importedWallets]);

	const handleDeviceNotAvailable = useCallback(() => {
		history.replace(generatePath(ProfilePaths.Dashboard, { profileId: activeProfile.id() }));
	}, [history, activeProfile]);

	const handleBack = useCallback(() => {
		onCancel?.();
	}, [activeTab, history, listenDevice]);

	return (
		<Tabs id="ledgerTabs" activeId={activeTab}>
			<div data-testid="LedgerTabs" className="mt-4">
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

				{[LedgerTabStep.LedgerScanStep, LedgerTabStep.LedgerImportStep].includes(activeTab) && (
					<ImportActionToolbar
						activeTab={activeTab - 2}
						showSteps
						showButtons={activeTab !== LedgerTabStep.LedgerImportStep}
						onBack={handleBack}
						isContinueDisabled={isNextDisabled || isSubmitting}
						isLoading={isSubmitting}
						onContinue={handleNext}
						allSteps={["1", "2"]}
						isSubmitDisabled={isSubmitting}
						showPortfoliobutton={activeTab === LedgerTabStep.LedgerImportStep}
					/>
				)}
			</div>
		</Tabs>
	);
};
