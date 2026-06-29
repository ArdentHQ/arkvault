import { Contracts } from "@/app/lib/profiles";
import { useExchangeRate } from "@/app/hooks/use-exchange-rate";
import { WalletToken } from "@/app/lib/profiles/wallet-token";
import { BigNumber } from "@/app/lib/helpers";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { useTranslation } from "react-i18next";
import { DetailTitle, DetailWrapper } from "@/app/components/DetailWrapper";
import React from "react";
import {
	ApprovalStatus,
	TransactionStepLabel,
	TransferStatus,
} from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/TransactionStepLabel";
import { BatchTransferTabStep } from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";
import { ThemeIcon } from "@/app/components/Icon";
import cn from "classnames";

interface TransferDetailsProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	recipients: RecipientItem[];
	tokenContractAddress: string;
}

export const calculateTotalAmount = (recipients: { amount?: number | string }[]) => {
	let amount = BigNumber.make(0);

	for (const recipient of recipients) {
		amount = amount.plus(BigNumber.make(recipient.amount ?? 0));
	}

	return amount;
};

export const useTransferDetails = ({
	profile,
	wallet,
	recipients,
	tokenContractAddress,
}: TransferDetailsProperties) => {
	const amount = calculateTotalAmount(recipients);

	const walletToken = wallet
		.tokens()
		.values()
		.find((token) => token.token().address() === tokenContractAddress) as WalletToken;

	const ticker = walletToken.token().displaySymbol();
	const exchangeTicker = profile.settings().get<string>(Contracts.ProfileSetting.ExchangeCurrency) as string;
	const { convert } = useExchangeRate({ exchangeTicker, profile, ticker });

	const convertedAmount = wallet.network().isTest() ? 0 : convert(amount.toFixed());

	return {
		amount,
		convertedAmount,
		exchangeTicker,
		walletToken,
	};
};

interface TransactionStepsProperties {
	approvalStatus: ApprovalStatus;
	transferStatus: TransferStatus;
}

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

export const TransactionSteps = ({ approvalStatus, transferStatus }: TransactionStepsProperties) => {
	const { t } = useTranslation();

	return (
		<DetailWrapper label={t("COMMON.TRANSACTION_STEPS")} className="rounded-xl">
			<div className="space-y-3">
				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-44 sm:min-w-44 sm:pr-6">Approve Contract</DetailTitle>
					<TransactionStepLabel status={approvalStatus} />
				</div>

				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-44 sm:min-w-44 sm:pr-6">Multiple Transfer</DetailTitle>
					<TransactionStepLabel status={transferStatus} />
				</div>

				<div className="-mx-4 -mb-3 mt-2 rounded-b-xl bg-theme-secondary-100 px-4 py-3 sm:-mx-6 sm:-mb-5 sm:px-6">
					<div className="flex items-center gap-2 text-theme-secondary-700">
						<p className="leading-4.25 text-sm font-semibold">
							Approval needs to be confirmed before your transfer is sent.
						</p>
					</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
