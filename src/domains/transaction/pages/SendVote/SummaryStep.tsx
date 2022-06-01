import { DTO } from "@payvo/sdk-profiles";
import React from "react";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { TransactionFee, TransactionVotes } from "@/domains/transaction/components/TransactionDetail";
import { TransactionSuccessful } from "@/domains/transaction/components/TransactionSuccessful";

type SummaryStepProperties = {
	transaction: DTO.ExtendedSignedTransactionData;
} & SendVoteStepProperties;

export const SummaryStep = ({ wallet, transaction, unvotes, votes }: SummaryStepProperties) => (
	<TransactionSuccessful transaction={transaction} senderWallet={wallet}>
		<TransactionVotes votes={votes} unvotes={unvotes} currency={wallet.currency()} />

		<TransactionFee currency={wallet.currency()} value={transaction.fee()} paddingPosition="top" />
	</TransactionSuccessful>
);
