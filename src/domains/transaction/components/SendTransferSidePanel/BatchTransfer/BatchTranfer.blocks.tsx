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

interface TransferDetailsProperties {
	profile: Contracts.IProfile;
	wallet: Contracts.IReadWriteWallet;
	recipients: RecipientItem[];
	tokenContractAddress: string;
}

export const calculateTotalAmount = (recipients: { amount?: number|string }[]) => {
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
			<div className="flex flex-col gap-3">
				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-44 sm:min-w-44 sm:pr-6">Approve Contract</DetailTitle>
					<TransactionStepLabel status={approvalStatus} />
				</div>
			</div>

			<div className="mt-3 flex flex-col gap-3">
				<div className="flex items-center justify-between space-x-2 sm:justify-start sm:space-x-0">
					<DetailTitle className="w-44 sm:min-w-44 sm:pr-6">Multiple Transfer</DetailTitle>
					<TransactionStepLabel status={transferStatus} />
				</div>
			</div>
		</DetailWrapper>
	);
};
