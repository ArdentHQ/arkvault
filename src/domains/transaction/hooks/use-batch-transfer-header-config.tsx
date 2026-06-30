import { useTranslation } from "react-i18next";
import { Contracts } from "@/app/lib/profiles";
import { ThemeIcon } from "@/app/components/Icon";
import cn from "classnames";
import React from "react";
import { BatchTransferTabStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";

interface BatchTransferStepConfigProperties {
	activeTab: BatchTransferTabStep;
	wallet?: Contracts.IReadWriteWallet;
	isConfirmed: boolean;
}

export const useBatchTransferStepConfig = ({ activeTab, isConfirmed }: BatchTransferStepConfigProperties) => {
	const { t } = useTranslation();

	const getTitle = () => {
		if (activeTab === BatchTransferTabStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === BatchTransferTabStep.ApproveStep) {
			return t("TRANSACTION.BATCH_TRANSFER.APPROVE_CONTRACT_STEP.TITLE");
		}

		if (activeTab === BatchTransferTabStep.SummaryStep) {
			return isConfirmed
				? t("TRANSACTION.BATCH_TRANSFER.SUMMARY_CONFIRMED_STEP.TITLE")
				: t("TRANSACTION.BATCH_TRANSFER.SUMMARY_PENDING_STEP.TITLE");
		}

		return t("TRANSACTION.BATCH_TRANSFER.CONFIRM_TRANSFER_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === BatchTransferTabStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === BatchTransferTabStep.ApproveStep) {
			return t("TRANSACTION.BATCH_TRANSFER.APPROVE_CONTRACT_STEP.DESCRIPTION");
		}

		if (activeTab === BatchTransferTabStep.SummaryStep) {
			return isConfirmed
				? t("TRANSACTION.BATCH_TRANSFER.SUMMARY_CONFIRMED_STEP.DESCRIPTION")
				: t("TRANSACTION.BATCH_TRANSFER.SUMMARY_PENDING_STEP.DESCRIPTION");
		}

		return t("TRANSACTION.BATCH_TRANSFER.CONFIRM_TRANSFER_STEP.DESCRIPTION");
	};

	const getTitleIcon = () => {
		if (activeTab === BatchTransferTabStep.ReviewStep) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		if (activeTab === BatchTransferTabStep.SummaryStep) {
			return (
				<ThemeIcon
					lightIcon={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
					darkIcon={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
					dimIcon={isConfirmed ? "CheckmarkDoubleCircle" : "UnconfirmedTransaction"}
					dimensions={[24, 24]}
					className={cn({
						"text-theme-primary-600": !isConfirmed,
						"text-theme-success-600": isConfirmed,
					})}
				/>
			);
		}

		return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
	};

	return { getSubtitle, getTitle, getTitleIcon };
};
