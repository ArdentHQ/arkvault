import { Contracts } from "@/app/lib/profiles";

export enum BatchTransferTabStep {
	ReviewStep = 1,
	ApproveStep = 2,
	SummaryStep,
	ConfirmTransferStep,
	ErrorStep,
}

export interface BatchTransferTabsProperties {
	onBack?: () => void;
	onSubmit?: () => void;
	onCancel?: () => void;
	onStepChange?: (step: BatchTransferTabStep) => void;
	activeIndex?: BatchTransferTabStep;
	wallet: Contracts.IReadWriteWallet;
}
