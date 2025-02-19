import { Networks } from "../../../../../../../platform-sdk/packages/sdk";
import { Contracts } from "../../../../../../../platform-sdk/packages/profiles/source/helpers";

import { useLedgerScanner } from "@/app/contexts";

export enum LedgerTabStep {
	ListenLedgerStep = 1,
	NetworkStep,
	LedgerConnectionStep,
	LedgerScanStep,
	LedgerImportStep,
}

export interface LedgerTabsProperties {
	activeIndex?: LedgerTabStep;
	onClickEditWalletName: (wallet: Contracts.IReadWriteWallet) => void;
}

export interface LedgerTableProperties extends ReturnType<typeof useLedgerScanner> {
	network: Networks.Network;
	scanMore: () => void;
}
