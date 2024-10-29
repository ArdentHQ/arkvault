import cn from "classnames";
import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";

import { useConfirmedTransaction } from "./hooks/useConfirmedTransaction";
import { StepHeader } from "@/app/components/StepHeader";
import { Icon } from "@/app/components/Icon";
import { TransactionDetailContent } from "@/domains/transaction/components/TransactionDetailModal";
import { isAwaitingMusigSignatures } from "@/domains/transaction/hooks";

interface TransactionSuccessfulProperties {
	transaction: DTO.ExtendedSignedTransactionData;
	senderWallet: Contracts.IReadWriteWallet;
	children?: React.ReactNode;
}

export const TransactionSuccessful = ({ transaction, senderWallet }: TransactionSuccessfulProperties) => {
	const { t } = useTranslation();

	const { isConfirmed, confirmations } = useConfirmedTransaction({
		transactionId: transaction.id(),
		wallet: senderWallet,
	});

	const pending = isAwaitingMusigSignatures(transaction)
		? t("TRANSACTION.SUCCESS.CREATED")
		: t("TRANSACTION.PENDING.TITLE");
	const titleText = isConfirmed ? t("TRANSACTION.SUCCESS.CONFIRMED") : pending;

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

			<TransactionDetailContent
				transactionItem={transaction}
				profile={senderWallet.profile()}
				isConfirmed={isConfirmed}
				confirmations={confirmations}
				containerClassname="-mx-3 sm:mx-0"
			/>
		</section>
	);
};
