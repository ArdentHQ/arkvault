import { DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { TransactionDetailPadded, TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";

type SummaryStepProperties = {
	transaction: DTO.ExtendedSignedTransactionData;
} & SendVoteStepProperties;

export const SummaryStep = ({ wallet, transaction, unvotes, votes }: SummaryStepProperties) => (
	<TransactionSuccessful transaction={transaction} senderWallet={wallet}>
		<TransactionDetailPadded>
			<VoteTransactionType votes={votes} unvotes={unvotes} currency={wallet.currency()} />
		</TransactionDetailPadded>
	</TransactionSuccessful>
);
