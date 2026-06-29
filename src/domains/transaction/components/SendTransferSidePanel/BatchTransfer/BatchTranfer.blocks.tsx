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

				<div className="-mx-4 -mb-3 rounded-b-xl bg-theme-secondary-100 px-4 py-3 sm:-mx-6 sm:-mb-5 sm:px-6 mt-2">
					<div className="flex items-center gap-2 text-theme-secondary-700">
						<p className="text-sm font-semibold leading-4.25">
							Approval needs to be confirmed before your transfer is sent.
						</p>
					</div>
				</div>
			</div>
		</DetailWrapper>
	);
};
