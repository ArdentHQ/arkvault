import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { Icon } from "@/app/components/Icon";
import { getMultiSignatureInfo, transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";
import {
	TransactionType,
	TransactionAddresses,
	TransactionSummary,
	TransactionMusigParticipants,
	TransactionId,
} from "@/domains/transaction/components/TransactionDetail";
import { ExtendedSignedTransactionData } from "@/domains/transaction/pages/SendRegistration/SendRegistration.contracts";
import { StepHeader } from "@/app/components/StepHeader";
import { DetailLabel, DetailPadded, DetailWrapper } from "@/app/components/DetailWrapper";

interface TransactionSuccessfulProperties {
	children?: React.ReactNode;
	transaction: ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	title?: string;
	description?: string;
	banner?: string;
	showExplorerLink?: boolean;
}

export const MultiSignatureSuccessful = ({
	transaction,
	senderWallet,
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	return (
		<section data-testid="TransactionSuccessful" className="space-y-8">
			<StepHeader
				title={t("TRANSACTION.SUCCESS.CREATED")}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name="PendingTransaction"
						data-testid="icon-PendingTransaction"
						className="text-theme-primary-600"
					/>
				}
			/>

			<div className="mt-4">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-4">
				<DetailPadded>
					<TransactionAddresses
						explorerLink={transaction.explorerLink()}
						profile={senderWallet.profile()}
						senderAddress={transaction.sender()}
						network={transaction.wallet().network()}
						recipients={[]}
					/>
				</DetailPadded>

				<DetailPadded>
					<TransactionType transaction={transaction} />
				</DetailPadded>

				<DetailPadded>
					<TransactionSummary
						transaction={transaction}
						senderWallet={transaction.wallet()}
					/>
				</DetailPadded>

				{[!!transaction.memo(), transaction.isMultiPayment(), transaction.isTransfer()].some(Boolean) && (
					<DetailPadded>
						<DetailWrapper label={t("COMMON.MEMO_SMARTBRIDGE")}>
							{transaction.memo() && <p>{transaction.memo()}</p>}
							{!transaction.memo() && (
								<p className="text-theme-secondary-500">{t("COMMON.NOT_AVAILABLE")}</p>
							)}
						</DetailWrapper>
					</DetailPadded>
				)}

				{transaction.isMultiSignatureRegistration() && (
					<DetailPadded>
						<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
						<div className="mt-2">
							<TransactionMusigParticipants publicKeys={transactionPublicKeys(transaction).publicKeys} profile={senderWallet.profile()} network={senderWallet.network()} />
						</div>
					</DetailPadded>
				)}
			</div>
		</section>
	);
};
