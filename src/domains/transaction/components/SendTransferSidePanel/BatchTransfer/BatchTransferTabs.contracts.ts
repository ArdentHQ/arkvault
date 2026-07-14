import { Contracts } from "@/app/lib/profiles";

export enum BatchTransferTabStep {
	ReviewStep = 1,
	ApproveStep = 2,
	SummaryStep,
	ConfirmTransferStep,
}

export interface BatchTransferTabsProperties {
	onBack?: () => void;
	onSubmit: () => void | Promise<void>;
	onCancel?: () => void;
	onError: (error: string) => void;
	setActiveTab: (step: BatchTransferTabStep) => void;
	activeTab: BatchTransferTabStep;
	wallet: Contracts.IReadWriteWallet;
	onApproveConfirmed: () => void;
	ledgerIsAwaitingDevice?: boolean;
	ledgerIsAwaitingApp?: boolean;
}
