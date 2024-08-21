import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionDetailPadded, TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { TransactionSummary } from "@/domains/transaction/components/TransactionDetail/TransactionSummary";

interface SummaryStepProperties {
	senderWallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}

export const SummaryStep = ({ senderWallet, transaction }: SummaryStepProperties): JSX.Element => (
	<TransactionSuccessful transaction={transaction} senderWallet={senderWallet}>
		<TransactionDetailPadded>
			<TransactionSummary senderWallet={senderWallet} transaction={transaction} />
		</TransactionDetailPadded>
	</TransactionSuccessful>
);
