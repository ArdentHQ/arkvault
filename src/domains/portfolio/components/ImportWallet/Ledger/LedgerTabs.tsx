import { uniq } from "@ardenthq/sdk-helpers";
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
import { useWalletConfig } from "@/domains/wallet/hooks";
import { assertWallet } from "@/utils/assertions";
import { ProfilePaths } from "@/router/paths";
import { useActiveNetwork } from "@/app/hooks/use-active-network";

export const LedgerTabs = ({
	activeIndex = LedgerTabStep.ListenLedgerStep,
	onClickEditWalletName,
}: LedgerTabsProperties) => {
	const activeProfile = useActiveProfile();
	const { activeNetwork } = useActiveNetwork({ profile: activeProfile });

	const history = useHistory();
	const { importLedgerWallets, isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected } =
		useLedgerContext();

	const { selectedNetworkIds, setValue } = useWalletConfig({ profile: activeProfile });

	const { formState, getValues, handleSubmit } = useFormContext();
	const { isValid, isSubmitting } = formState;

	const [importedWallets, setImportedWallets] = useState<LedgerData[]>([]);
	const [activeTab, setActiveTab] = useState<number>(activeIndex);

	const isMultiple = useMemo(() => importedWallets.length > 1, [importedWallets]);

	const [_, setShowRetry] = useState(false);
	const [cancelling, setCancelling] = useState(false);
	const retryFunctionReference = useRef<() => void>();

	const importWallets = useCallback(
		async ({ network, wallets }: any) => {
			setImportedWallets(wallets);
			const coin = activeProfile.coins().set(network.coin(), network.id());
			await importLedgerWallets(wallets, coin, activeProfile);

			setValue("selectedNetworkIds", uniq([...selectedNetworkIds, coin.network().id()]));
		},
		[importLedgerWallets, activeProfile, setValue, selectedNetworkIds],
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
		console.log("activeTab");
		if (activeTab === LedgerTabStep.LedgerScanStep) {
			await handleSubmit((data: any) => importWallets(data))();
		}

		setActiveTab(activeTab + 1);
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
		if (isMultiple) {
			history.push(`/profiles/${activeProfile.id()}/dashboard`);
			return;
		}

		const importedWallet = activeProfile
			.wallets()
			.findByAddressWithNetwork(importedWallets[0].address, getValues("network").id());

		assertWallet(importedWallet);
		history.push(`/profiles/${activeProfile.id()}/wallets/${importedWallet.id()}`);
	}, [isMultiple, history, activeProfile, getValues, importedWallets]);

	const handleDeviceNotAvailable = useCallback(() => {
		history.replace(generatePath(ProfilePaths.Dashboard, { profileId: activeProfile.id() }));
	}, [history, activeProfile]);

	return (
		<Tabs id="ledgerTabs" activeId={activeTab}>
			<div data-testid="LedgerTabs" className="mt-8">
				<TabPanel tabId={LedgerTabStep.ListenLedgerStep}>
					<ListenLedger
						onDeviceAvailable={() => setActiveTab(LedgerTabStep.LedgerConnectionStep)}
						onDeviceNotAvailable={handleDeviceNotAvailable}
					/>
				</TabPanel>

				<TabPanel tabId={LedgerTabStep.LedgerConnectionStep}>
					<LedgerConnectionStep
						cancelling={cancelling}
						onConnect={() => setActiveTab(LedgerTabStep.LedgerScanStep)}
						network={activeNetwork}
					/>
				</TabPanel>

				<TabPanel tabId={LedgerTabStep.LedgerScanStep}>
					<LedgerScanStep cancelling={cancelling} profile={activeProfile} setRetryFn={handleRetry} network={activeNetwork}/>
				</TabPanel>

				<TabPanel tabId={LedgerTabStep.LedgerImportStep}>
					<LedgerImportStep
						wallets={importedWallets}
						profile={activeProfile}
						onClickEditWalletName={onClickEditWalletName}
					/>
				</TabPanel>
			</div>
		</Tabs>
	);
};
