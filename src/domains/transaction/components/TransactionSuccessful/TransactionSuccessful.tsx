import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import {
	TransactionAddresses,
	TransactionConfirmations,
	TransactionMusigParticipants,
	TransactionType,
} from "@/domains/transaction/components/TransactionDetail";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { DetailLabel, DetailPadded } from "@/app/components/DetailWrapper";
import { TransactionId } from "@/domains/transaction/components/TransactionDetail/TransactionId";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { transactionPublicKeys } from "@/domains/transaction/components/MultiSignatureDetail/MultiSignatureDetail.helpers";

interface TransactionSuccessfulProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	title?: string;
	description?: string;
	children?: React.ReactNode;
	recipients?: RecipientItem[];
}

export const TransactionSuccessful = ({
	transaction,
	senderWallet,
	title,
	children,
	recipients = [],
}: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed, confirmations } = useConfirmedTransaction({
		transactionId: transaction.id(),
		wallet: senderWallet,
	});

	const titleText = title ?? (isConfirmed ? t("TRANSACTION.SUCCESS.CONFIRMED") : t("TRANSACTION.PENDING.TITLE"));

	return (
		<section data-testid={isConfirmed ? "TransactionSuccessful" : "TransactionPending"}>
			<StepHeader
				title={titleText}
				titleIcon={
					<Icon
						dimensions={[24, 24]}
						name={isConfirmed ? "CheckmarkDoubleCircle" : "PendingTransaction"}
						data-testid="icon-PendingTransaction"
						className={cn({
							"text-theme-primary-600": !isConfirmed,
							"text-theme-success-600": isConfirmed,
						})}
					/>
				}
			/>

			<div className="mt-8">
				<TransactionId transaction={transaction} />
			</div>

			<div className="mt-6 space-y-8">
				<DetailPadded>
					<TransactionAddresses
						network={senderWallet.network()}
						senderAddress={senderWallet.address()}
						recipients={recipients}
						profile={senderWallet.profile()}
					/>
				</DetailPadded>

				{!transaction.isVote() && (
					<DetailPadded>
						<TransactionType transaction={transaction} />
					</DetailPadded>
				)}

				{children}

				{senderWallet.transaction().isAwaitingConfirmation(transaction.id()) && (
					<DetailPadded>
						<DetailLabel>{t("TRANSACTION.CONFIRMATIONS")}</DetailLabel>
						<div className="mt-2">
							<TransactionConfirmations isConfirmed={isConfirmed} confirmations={confirmations} transaction={transaction} />
						</div>
					</DetailPadded>
				)}

				{transaction.usesMultiSignature() && (
					<DetailPadded>
						<DetailLabel>{t("TRANSACTION.PARTICIPANTS")}</DetailLabel>
						<div className="mt-2">
							<TransactionMusigParticipants
								publicKeys={transactionPublicKeys(transaction).publicKeys}
								profile={senderWallet.profile()}
								network={senderWallet.network()}
								useExplorerLinks
							/>
						</div>
					</DetailPadded>
				)}
			</div>
		</section>
	);
};
