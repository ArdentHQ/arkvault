import { Networks } from "@ardenthq/sdk";
import { Contracts } from "@ardenthq/sdk-profiles";

import { useLedgerScanner } from "@/app/contexts";

export enum LedgerTabStep {
	ListenLedgerStep = 1,
	LedgerConnectionStep,
	LedgerScanStep,
	LedgerImportStep,
}

export interface LedgerTabsProperties {
	onBack?: () => void;
	onCancel?: () => void;
	onStepChange?: (step: LedgerTabStep) => void;
	activeIndex?: LedgerTabStep;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}

export interface LedgerTableProperties extends ReturnType<typeof useLedgerScanner> {
	network: Networks.Network;
	scanMore: () => void;
}
