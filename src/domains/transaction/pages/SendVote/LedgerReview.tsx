import React from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { SendVoteStepProperties } from "./SendVote.contracts";
import { TotalAmountBox } from "@/domains/transaction/components/TotalAmountBox";
import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { VoteList } from "@/domains/vote/components/VoteList";

export const VoteLedgerReview = ({ wallet, votes, unvotes }: SendVoteStepProperties) => {
	const { getValues } = useFormContext();
	const { t } = useTranslation();

	const fee = getValues("fee");

	return (
		<>
			{unvotes.length > 0 && (
				<TransactionDetail label={t("TRANSACTION.UNVOTES_COUNT", { count: unvotes.length })} border={false}>
					<VoteList votes={unvotes} currency={wallet.currency()} isNegativeAmount />
				</TransactionDetail>
			)}

			{votes.length > 0 && (
				<TransactionDetail
					label={t("TRANSACTION.VOTES_COUNT", { count: votes.length })}
					border={unvotes.length > 0}
				>
					<VoteList votes={votes} currency={wallet.currency()} />
				</TransactionDetail>
			)}

			<div className="mt-2">
				<TotalAmountBox amount={0} fee={fee} ticker={wallet.currency()} />
			</div>
		</>
	);
};
