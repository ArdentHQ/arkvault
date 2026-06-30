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
import {
	BatchTransferTabStep
} from "@/domains/transaction/components/SendTransferSidePanel/BatchTransfer/BatchTransferTabs.contracts";
import { Button } from "@/app/components/Button";

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

interface ActionsProperties {
	activeTab: BatchTransferTabStep;
	isConfirmed: boolean;
	handleNext: () => Promise<void>;
	handleBack: () => void;
	isNextDisabled: boolean;
}

export const BatchTransferActions = ({ activeTab, isConfirmed, handleBack, handleNext, isNextDisabled }: ActionsProperties) => {
	const { t } = useTranslation();

	if (activeTab === BatchTransferTabStep.SummaryStep && !isConfirmed) {
		return (
			<div className="leading-11 w-full text-center text-sm text-theme-secondary-700">
				Once confirmed, you'll be taken to the next step automatically.
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
					Continuing to transfer in 2s...
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
