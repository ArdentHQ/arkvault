import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionFee } from "@/domains/transaction/components/TransactionDetail";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";

interface SummaryStepProperties {
	senderWallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}

export const SummaryStep = ({ senderWallet, transaction }: SummaryStepProperties) => (
	<TransactionSuccessful transaction={transaction} senderWallet={senderWallet}>
		<TransactionFee currency={senderWallet.currency()} value={transaction.fee()} paddingPosition="top" />
	</TransactionSuccessful>
);
