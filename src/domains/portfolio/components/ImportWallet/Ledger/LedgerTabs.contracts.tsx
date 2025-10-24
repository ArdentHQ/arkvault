import { Networks } from "@/app/lib/mainsail";
import { Contracts } from "@/app/lib/profiles";

import { useLedgerScanner } from "@/app/contexts";

export enum LedgerTabStep {
	ListenLedgerStep = 1,
	LedgerConnectionStep,
	LedgerScanStep,
	LedgerImportStep,
}

export interface LedgerTabsProperties {
	onBack?: () => void;
	onSubmit?: () => void;
	onCancel?: () => void;
	onStepChange?: (step: LedgerTabStep) => void;
	activeIndex?: LedgerTabStep;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}

export interface LedgerTableProperties extends ReturnType<typeof useLedgerScanner> {
	network: Networks.Network;
	scanMore: () => void;
	pageSize?: number;
	disableColdWallets?: boolean
}
