export enum MigrateLedgerStep {
	ListenLedgerStep = 1,
	ConnectionStep,
	ScanStep,
	OverviewStep,
	ApproveTransactionStep,
	ErrorStep,
	PendingConfirmationStep,
	SuccessStep,
}
