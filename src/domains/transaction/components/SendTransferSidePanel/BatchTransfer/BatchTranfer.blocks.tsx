import { useTranslation } from "react-i18next";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import React from "react";
import {
	ApprovalStatus,
	TransactionStepLabel,
	TransferStatus,
} from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/TransactionStepLabel";
import { BatchTransferTabStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";
import { Button } from "@/app/components/Button";

interface TransactionStepsProperties {
	approvalStatus: ApprovalStatus;
	transferStatus: TransferStatus;
}

export const TransactionSteps = ({ approvalStatus, transferStatus }: TransactionStepsProperties) => {
	const { t } = useTranslation();

	return (
		<DetailWrapper label={t("COMMON.TRANSACTION_STEPS")} className="rounded-xl">
			<div className="space-y-2 sm:space-y-3">
				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-44 sm:min-w-44 sm:pr-6">
						{t("TRANSACTION.BATCH_TRANSFER.APPROVE_CONTRACT")}
					</DetailTitle>
					<TransactionStepLabel status={approvalStatus} />
				</div>

				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-44 sm:min-w-44 sm:pr-6">
						{t("TRANSACTION.BATCH_TRANSFER.MULTIPLE_TRANSFER")}
					</DetailTitle>
					<TransactionStepLabel status={transferStatus} />
				</div>

				<div className="-mb-3 mt-3 rounded bg-theme-secondary-100 px-4 py-2 dim:bg-theme-dim-950 dark:bg-theme-dark-950 sm:-mx-6 sm:-mb-5 sm:rounded-b-xl sm:px-6 sm:py-3">
					<div className="flex items-center gap-2 text-theme-secondary-700 dim:text-theme-dim-100 dark:text-theme-dark-100">
						<p className="leading-4.25 sm:leading-5.25 text-sm font-semibold">
							{transferStatus === "awaiting" && t("TRANSACTION.BATCH_TRANSFER.AWAITING_APPROVAL_HINT")}
							{transferStatus === "active" && t("TRANSACTION.BATCH_TRANSFER.AWAITING_TRANSFER_HINT")}
						</p>
					</div>
				</div>
			</div>
		</DetailWrapper>
	);
};

interface ActionsProperties {
	activeTab: BatchTransferTabStep;
	isConfirmed: boolean;
	handleNext: () => Promise<void>;
	handleBack: () => void;
	isNextDisabled: boolean;
}

export const BatchTransferActions = ({
	activeTab,
	isConfirmed,
	handleBack,
	handleNext,
	isNextDisabled,
}: ActionsProperties) => {
	const { t } = useTranslation();

	if (activeTab === BatchTransferTabStep.SummaryStep && !isConfirmed) {
		return (
			<div className="leading-11 w-full text-center text-sm text-theme-secondary-700">
				{t("TRANSACTION.BATCH_TRANSFER.SUMMARY_PENDING_STEP.AWAITING_HINT")}
			</div>
		);
	}

	return (
		<>
			{activeTab !== BatchTransferTabStep.SummaryStep && (
				<Button variant="secondary" onClick={handleBack} data-testid="BatchTranfer__back-button">
					{t("COMMON.BACK")}
				</Button>
			)}

			{activeTab === BatchTransferTabStep.SummaryStep && (
				<div className="leading-5.25 w-full text-sm text-theme-secondary-700">
					{t("TRANSACTION.BATCH_TRANSFER.SUMMARY_CONFIRMED_STEP.NAVIGATING_HINT")}
				</div>
			)}

			<Button onClick={handleNext} data-testid="BatchTranfer__continue-button" disabled={isNextDisabled}>
				{activeTab === BatchTransferTabStep.ReviewStep && t("COMMON.CONTINUE")}
				{activeTab === BatchTransferTabStep.ApproveStep && t("COMMON.APPROVE")}
				{activeTab === BatchTransferTabStep.SummaryStep && t("COMMON.CONTINUE_NOW")}
				{activeTab === BatchTransferTabStep.ConfirmTransferStep && t("COMMON.CONFIRM_TRANSACTION")}
			</Button>
		</>
	);
};
