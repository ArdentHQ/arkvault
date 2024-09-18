import { DTO } from "@ardenthq/sdk-profiles";
import React from "react";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";
import { VoteTransactionType } from "@/domains/transaction/components/VoteTransactionType";
import { DetailPadded } from "@/app/components/DetailWrapper";

type SummaryStepProperties = {
	transaction: DTO.ExtendedSignedTransactionData;
} & SendVoteStepProperties;

export const SummaryStep = ({ wallet, transaction, unvotes, votes }: SummaryStepProperties) => (
	<TransactionSuccessful transaction={transaction} senderWallet={wallet}>
		<DetailPadded>
			<VoteTransactionType votes={votes} unvotes={unvotes} />
		</DetailPadded>
	</TransactionSuccessful>
);
