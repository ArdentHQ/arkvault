import { Amount } from "@/app/components/Amount";
import { Contracts } from "@/app/lib/profiles";
import React from "react";
import { SendTransferStep } from "@/domains/transaction/components/SendTransferSidePanel/SendTransfer.contracts";
import { useTranslation } from "react-i18next";
import { ThemeIcon } from "@/app/components/Icon";
import { getAuthenticationStepSubtitle } from "@/domains/transaction/utils";
import cn from "classnames";
import { Image } from "@/app/components/Image";
import { BatchTransferTabStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";

export const ExchangeCurrencyAmount = ({
	convertedAmount,
	isTestnet,
	exchangeTicker,
}: {
	convertedAmount?: number;
	isTestnet?: boolean;
	exchangeTicker?: string;
}) => (
	<>
		{!isTestnet && !!convertedAmount && !!exchangeTicker && (
			<div className="font-semibold text-theme-secondary-700">
				<Amount
					ticker={exchangeTicker}
					value={convertedAmount}
					className="whitespace-normal break-all text-sm md:text-base"
				/>
			</div>
		)}
	</>
);

interface SendTransferStepConfigProperties {
	activeTab: SendTransferStep;
	isConfirmed: boolean;
	wallet?: Contracts.IReadWriteWallet;
}

export const useSendTransferStepConfig = ({ activeTab, wallet, isConfirmed }: SendTransferStepConfigProperties) => {
	const { t } = useTranslation();

	const getTitle = () => {
		if (activeTab === SendTransferStep.ErrorStep) {
			return t("TRANSACTION.ERROR.TITLE");
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			return t("TRANSACTION.AUTHENTICATION_STEP.TITLE");
		}

		if (activeTab === SendTransferStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === SendTransferStep.SummaryStep) {
			return isConfirmed ? t("TRANSACTION.SUCCESS.CREATED") : t("TRANSACTION.PENDING.TITLE");
		}

		return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.TITLE");
	};

	const getSubtitle = () => {
		if (activeTab === SendTransferStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === SendTransferStep.AuthenticationStep) {
			return getAuthenticationStepSubtitle({ t, wallet });
		}

		if (activeTab === SendTransferStep.FormStep) {
			return t("TRANSACTION.PAGE_TRANSACTION_SEND.FORM_STEP.DESCRIPTION");
		}

		return;
	};

	const getTitleIcon = () => {
		if (activeTab === SendTransferStep.ErrorStep) {
			return <Image name="ErrorHeaderIcon" domain="transaction" className="block h-[20px] w-[20px]" />;
		}

		if (activeTab === SendTransferStep.SummaryStep) {
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

		if (activeTab === SendTransferStep.AuthenticationStep) {
			if (wallet?.isLedger()) {
				return (
					<ThemeIcon
						lightIcon="LedgerLight"
						darkIcon="LedgerDark"
						dimIcon="LedgerDim"
						dimensions={[24, 24]}
					/>
				);
			}

			return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
		}

		if (activeTab === SendTransferStep.ReviewStep) {
			return (
				<ThemeIcon
					lightIcon="DocumentView"
					darkIcon="DocumentView"
					dimIcon="DocumentView"
					dimensions={[24, 24]}
				/>
			);
		}

		return (
			<ThemeIcon
				lightIcon="SendTransactionLight"
				darkIcon="SendTransactionDark"
				dimIcon="SendTransactionDim"
				dimensions={[24, 24]}
			/>
		);
	};

	return { getSubtitle, getTitle, getTitleIcon };
};

interface BatchTransferStepConfigProperties {
	activeTab: BatchTransferTabStep;
	wallet?: Contracts.IReadWriteWallet;
	isConfirmed: boolean;
}

export const useBatchTransferStepConfig = ({ activeTab, wallet, isConfirmed }: BatchTransferStepConfigProperties) => {
	const { t } = useTranslation();

	const getTitle = () => {
		if (activeTab === BatchTransferTabStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.TITLE");
		}

		if (activeTab === BatchTransferTabStep.ApproveStep) {
			return "Approve Contract";
		}

		if (activeTab === BatchTransferTabStep.SummaryStep) {
			return "Approving Contract";
		}

		return "Confirm Transfer";
	};

	const getSubtitle = () => {
		if (activeTab === BatchTransferTabStep.ReviewStep) {
			return t("TRANSACTION.REVIEW_STEP.DESCRIPTION");
		}

		if (activeTab === BatchTransferTabStep.ApproveStep) {
			return "Before sending tokens to multiple recipients, you need to approve the spend amount for the multiple transfer contract.";
		}

		if (activeTab === BatchTransferTabStep.SummaryStep) {
			return "Waiting for spend approval to be confirmed on the blockchain.";
		}

		return "Transfer tokens to multiple recipients.";
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

		if (activeTab === BatchTransferTabStep.ConfirmTransferStep) {
			return <ThemeIcon lightIcon="Mnemonic" darkIcon="Mnemonic" dimIcon="Mnemonic" dimensions={[24, 24]} />;
		}

		return (
			<ThemeIcon
				lightIcon="SendTransactionLight"
				darkIcon="SendTransactionDark"
				dimIcon="SendTransactionDim"
				dimensions={[24, 24]}
			/>
		);
	};

	return { getSubtitle, getTitle, getTitleIcon };
};
