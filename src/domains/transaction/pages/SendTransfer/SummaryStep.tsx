import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { TransactionSummary } from "@/domains/transaction/components/TransactionDetail/TransactionSummary";

interface SummaryStepProperties {
	profile: Contracts.IProfile;
	senderWallet: Contracts.IReadWriteWallet;
	transaction: DTO.ExtendedSignedTransactionData;
}

export const SummaryStep = ({ profile, senderWallet, transaction }: SummaryStepProperties): JSX.Element => {
	return (
		<TransactionSuccessful transaction={transaction} senderWallet={senderWallet}>
			<TransactionSummary senderWallet={senderWallet} transaction={transaction} />
		</TransactionSuccessful>
	);
};
