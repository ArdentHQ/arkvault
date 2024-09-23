import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { TransactionSummary } from "@/domains/transaction/components/TransactionDetail/TransactionSummary";
import { RecipientItem } from "@/domains/transaction/components/RecipientList/RecipientList.contracts";
import { DetailPadded } from "@/app/components/DetailWrapper";

interface SummaryStepProperties {
	senderWallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
	recipients: RecipientItem[];
}

export const SummaryStep = ({ senderWallet, transaction, recipients }: SummaryStepProperties): JSX.Element => (
	<TransactionSuccessful transaction={transaction} senderWallet={senderWallet} recipients={recipients}>
		<DetailPadded>
			<TransactionSummary senderWallet={senderWallet} transaction={transaction} />
		</DetailPadded>
	</TransactionSuccessful>
);
