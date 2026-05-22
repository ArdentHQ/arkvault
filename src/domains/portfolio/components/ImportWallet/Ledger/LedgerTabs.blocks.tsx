import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { generatePath } from "react-router";

import { ImportActionToolbar } from "@/domains/portfolio/components/ImportWallet/ImportAddressSidePanel.blocks";
import { Button } from "@/app/components/Button";

import { LedgerTabStep } from "./LedgerTabs.contracts";
import { LedgerData } from "@/app/contexts";
import { ProfilePaths } from "@/router/paths";
import { assertString } from "@/utils/assertions";

export interface UseLedgerTabsGoToPrevDeps {
	activeIndex: number;
	onStepChange?: (step: LedgerTabStep) => void;
}

export interface UseLedgerTabsGoToPrevResult {
	goToPreviousStep: () => void;
	activeTab: number;
	showRetry: boolean;
	setActiveTab: React.Dispatch<React.SetStateAction<number>>;
	setShowRetry: React.Dispatch<React.SetStateAction<boolean>>;
}

export const useLedgerTabsGoToPrev = ({
	activeIndex,
	onStepChange,
}: UseLedgerTabsGoToPrevDeps): UseLedgerTabsGoToPrevResult => {
	const [activeTab, setActiveTab] = useState<number>(activeIndex);
	const [showRetry, setShowRetry] = useState<boolean>(false);

	const goToPreviousStep = useCallback(() => {
		setShowRetry(false);
		setActiveTab((prev) => {
			const next = Math.max(LedgerTabStep.ListenLedgerStep, prev - 1);
			onStepChange?.(next);
			return next;
		});
	}, [onStepChange]);

	return {
		goToPreviousStep,
		activeTab,
		showRetry,
		setActiveTab,
		setShowRetry,
	};
};

export interface UseLedgerTabsHandleNextDeps {
	activeTab: number;
	showRetry: boolean;
	onStepChange?: (step: LedgerTabStep) => void;
	setShowRetry: React.Dispatch<React.SetStateAction<boolean>>;
	setActiveTab: React.Dispatch<React.SetStateAction<number>>;
	handleSubmit: <T>(onSuccess: (data: T) => void | Promise<void>) => () => void;
	handleWalletImporting: (params: { wallets: unknown[] }) => Promise<void>;
}

export interface UseLedgerTabsHandleNextResult {
	handleNext: () => Promise<void>;
}

export const useLedgerTabsHandleNext = ({
	activeTab,
	showRetry,
	onStepChange,
	setShowRetry,
	setActiveTab,
	handleSubmit,
	handleWalletImporting,
}: UseLedgerTabsHandleNextDeps): UseLedgerTabsHandleNextResult => {
	const handleNext = useCallback(async () => {
		if (showRetry) {
			setShowRetry(false);
		}

		if (activeTab === LedgerTabStep.LedgerScanStep) {
			await handleSubmit((data: unknown) => handleWalletImporting(data as { wallets: unknown[] }))();
		}

		const next = activeTab + 1;
		setActiveTab(next);
		onStepChange?.(next);
	}, [activeTab, showRetry, handleSubmit, handleWalletImporting, onStepChange]);

	return { handleNext };
};

export interface UseLedgerTabsHandleRetryDeps {
	retryFunctionReference: React.MutableRefObject<(() => void) | undefined>;
	goToPreviousStep: () => void;
}

export interface UseLedgerTabsHandleRetryResult {
	handleRetry: () => void;
}

export const useLedgerTabsHandleRetry = ({
	retryFunctionReference,
	goToPreviousStep,
}: UseLedgerTabsHandleRetryDeps): UseLedgerTabsHandleRetryResult => {
	const handleRetry = useCallback(() => {
		const callback = retryFunctionReference.current;
		if (callback) {
			callback();
		} else {
			goToPreviousStep();
		}
	}, [retryFunctionReference, goToPreviousStep]);

	return { handleRetry };
};

export interface UseLedgerTabsHandleFinishDeps {
	activeProfileId: string;
}

export interface UseLedgerTabsHandleFinishResult {
	handleFinish: () => void;
}

export const useLedgerTabsHandleFinish = ({
	activeProfileId,
}: UseLedgerTabsHandleFinishDeps): UseLedgerTabsHandleFinishResult => {
	const navigate = useNavigate();

	const handleFinish = useCallback(() => {
		navigate(`/profiles/${activeProfileId}/dashboard`);
	}, [activeProfileId, navigate]);

	return { handleFinish };
};

export interface UseLedgerTabsHandleDeviceNotAvailableDeps {
	activeProfileId: string;
}

export interface UseLedgerTabsHandleDeviceNotAvailableResult {
	handleDeviceNotAvailable: () => void;
}

export const useLedgerTabsHandleDeviceNotAvailable = ({
	activeProfileId,
}: UseLedgerTabsHandleDeviceNotAvailableDeps): UseLedgerTabsHandleDeviceNotAvailableResult => {
	const navigate = useNavigate();

	const handleDeviceNotAvailable = useCallback(() => {
		navigate(generatePath(ProfilePaths.Dashboard, { profileId: activeProfileId }));
	}, [activeProfileId, navigate]);

	return { handleDeviceNotAvailable };
};

export interface UseLedgerTabsHandleBackDeps {
	activeTab: number;
	setShowRetry: React.Dispatch<React.SetStateAction<boolean>>;
	setActiveTab: React.Dispatch<React.SetStateAction<number>>;
	onStepChange?: (step: LedgerTabStep) => void;
	onBack?: () => void;
	onCancel?: () => void;
}

export interface UseLedgerTabsHandleBackResult {
	handleBack: () => void;
}

export const useLedgerTabsHandleBack = ({
	activeTab,
	setShowRetry,
	setActiveTab,
	onStepChange,
	onBack,
	onCancel,
}: UseLedgerTabsHandleBackDeps): UseLedgerTabsHandleBackResult => {
	const handleBack = useCallback(() => {
		setShowRetry(false);

		if (activeTab === LedgerTabStep.LedgerImportStep) {
			const prev = LedgerTabStep.LedgerScanStep;
			setActiveTab(prev);
			onStepChange?.(prev);
			return;
		}
		if (onBack) {
			return onBack();
		}
		return onCancel?.();
	}, [activeTab, setShowRetry, setActiveTab, onStepChange, onBack, onCancel]);

	return { handleBack };
};

interface UseHandleWalletImportingParams {
	listenDevice: () => Promise<{ id?: string } | undefined>;
	importWallets: (params: {
		disableAddressSelection?: boolean;
		ledgerOptions: { deviceId: string; path: string };
		type: string;
		value: string;
	}) => Promise<void>;
}

export const useHandleWalletImporting = ({ listenDevice, importWallets }: UseHandleWalletImportingParams) => {
	const handleWalletImporting = useCallback(
		async ({ wallets }: { wallets: LedgerData[] }) => {
			const device = await listenDevice();
			const deviceId = device?.id;
			assertString(deviceId);

			await Promise.all(
				wallets.map(({ path, address }, index) =>
					importWallets({
						disableAddressSelection: index !== 0,
						ledgerOptions: {
							deviceId,
							path,
						},
						type: "LEDGER",
						value: address,
					}),
				),
			);

			return wallets;
		},
		[listenDevice, importWallets],
	);

	return { handleWalletImporting };
};

interface UseOnConnectParams {
	setShowRetry: (show: boolean) => void;
	setActiveTab: (tab: number) => void;
	onStepChange?: (step: number) => void;
}

export const useOnConnect = ({ setShowRetry, setActiveTab, onStepChange }: UseOnConnectParams) => {
	const onConnect = useCallback(() => {
		setShowRetry(false);
		setActiveTab(LedgerTabStep.LedgerScanStep);
		onStepChange?.(LedgerTabStep.LedgerScanStep);
	}, [setShowRetry, setActiveTab, onStepChange]);

	return { onConnect };
};

interface UseOnFailedParams {
	setShowRetry: (show: boolean) => void;
	goToPreviousStep: () => void;
	registerRetry: (callback?: () => void) => void;
}

export const useOnFailed = ({ setShowRetry, goToPreviousStep, registerRetry }: UseOnFailedParams) => {
	const onFailed = useCallback(() => {
		setShowRetry(true);
		registerRetry(() => {
			goToPreviousStep();
		});
	}, [setShowRetry, goToPreviousStep, registerRetry]);

	return { onFailed };
};

interface UseCancelParams {
	cancelling: boolean;
	isBusy: boolean;
	disconnect: () => Promise<void>;
	isAwaitingConnection: boolean;
	isAwaitingDeviceConfirmation: boolean;
	isConnected: boolean;
	setCancelling: (value: boolean) => void;
}

export const useCancel = ({
	cancelling,
	isBusy,
	disconnect,
	isAwaitingConnection,
	isAwaitingDeviceConfirmation,
	isConnected,
	setCancelling,
}: UseCancelParams) => {
	useEffect(() => {
		const cancel = async () => {
			await disconnect();
		};

		if (cancelling && !isBusy) {
			setCancelling(false);
			cancel();
		}
	}, [cancelling, isBusy, disconnect, isAwaitingConnection, isAwaitingDeviceConfirmation, isConnected]);
};

/* ── LedgerTabsFooter ─────────────────────────────────────────── */

interface LedgerTabsFooterProperties {
	showFooter: boolean;
	showRetry: boolean;
	activeTab: number;
	onBack: () => void;
	onContinue: () => void;
	handleRetry: () => void;
	isContinueDisabled: boolean;
	isLoading: boolean;
	isSubmitDisabled: boolean;
	onSubmit?: () => void;
}

export const LedgerTabsFooter = ({
	showFooter,
	showRetry,
	activeTab,
	onBack,
	onContinue,
	handleRetry,
	isContinueDisabled,
	isLoading,
	isSubmitDisabled,
	onSubmit,
}: LedgerTabsFooterProperties) => {
	if (!showFooter) {
		return null;
	}

	// Normal toolbar footer (no error)
	if (!showRetry) {
		return (
			<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
				<ImportActionToolbar
					showButtons={activeTab !== LedgerTabStep.LedgerImportStep}
					onBack={onBack}
					isContinueDisabled={isContinueDisabled || false}
					isLoading={isLoading}
					onContinue={onContinue}
					isSubmitDisabled={isSubmitDisabled}
					showPortfoliobutton={activeTab === LedgerTabStep.LedgerImportStep}
					onSubmit={onSubmit}
				/>
			</div>
		);
	}

	// Error-only footer (Back / Retry buttons)
	return (
		<div className="bg-theme-background border-theme-secondary-300 dark:border-theme-dark-700 absolute right-0 bottom-0 left-0 flex w-full flex-col border-t px-6 py-4">
			<div className="flex w-full items-center justify-end gap-3">
				<Button
					type="button"
					onClick={onBack}
					variant="secondary"
					data-testid="LedgerFooter__backToSelection"
				>
					Back
				</Button>

				<Button
					type="button"
					onClick={handleRetry}
					variant="primary"
					data-testid="LedgerFooter__retry"
					disabled={false}
				>
					Retry
				</Button>
			</div>
		</div>
	);
};

interface UseEnterHandlerParams {
	isNextDisabled: boolean;
	isSubmitting: boolean;
	activeTab: number;
	onHandleNext: () => void;
	onHandleFinish: () => void;
}

export const useEnterHandler = ({
	isNextDisabled,
	isSubmitting,
	activeTab,
	onHandleNext,
	onHandleFinish,
}: UseEnterHandlerParams) => {
	const handleEnter = (event: KeyboardEvent) => {
		const target = event.target as Element;
		const isComponentChild = target.closest("#ledgerTabs") !== null || target.tagName === "BODY";

		if (isComponentChild && !isNextDisabled && !isSubmitting) {
			if (activeTab < LedgerTabStep.LedgerImportStep) {
				onHandleNext();
			} else {
				onHandleFinish();
			}
		}
	};

	return { handleEnter };
};
