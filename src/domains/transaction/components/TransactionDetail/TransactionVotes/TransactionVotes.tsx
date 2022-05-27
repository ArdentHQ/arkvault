import { Contracts } from "@payvo/sdk-profiles";
import React from "react";
import { useTranslation } from "react-i18next";
import { Skeleton } from "@/app/components/Skeleton";

import { TransactionDetail } from "@/domains/transaction/components/TransactionDetail";
import { VoteList } from "@/domains/vote/components/VoteList";

interface TransactionVotesProperties {
	isLoading?: boolean;
	votes: Contracts.VoteRegistryItem[] | Contracts.IReadOnlyWallet[];
	unvotes: Contracts.VoteRegistryItem[] | Contracts.IReadOnlyWallet[];
	currency: string;
}

const defaultProps = {
	unvotes: [],
	votes: [],
};

export const TransactionVotes = ({
	isLoading = false,
	unvotes = defaultProps.unvotes,
	votes = defaultProps.votes,
	currency,
}: TransactionVotesProperties) => {
	const { t } = useTranslation();

	if (isLoading) {
		return (
			<div
				data-testid="TransactionVotes__skeleton"
				className="flex items-center justify-between border-t border-dashed border-theme-secondary-300 py-6 dark:border-theme-secondary-800"
			>
				<div className="flex flex-col space-y-2">
					<Skeleton height={14} width="25%" />
					<Skeleton height={16} width="75%" />
				</div>

				<Skeleton circle width={44} height={44} className="mb-1" />
			</div>
		);
	}

	return (
		<>
			{unvotes.length > 0 && (
				<TransactionDetail
					data-testid="TransactionUnvotes"
					label={t("TRANSACTION.UNVOTES_COUNT", { count: unvotes.length })}
				>
					<VoteList votes={unvotes} currency={currency} isNegativeAmount />
				</TransactionDetail>
			)}

			{votes.length > 0 && (
				<TransactionDetail
					data-testid="TransactionVotes"
					label={t("TRANSACTION.VOTES_COUNT", { count: votes.length })}
				>
					<VoteList votes={votes} currency={currency} />
				</TransactionDetail>
			)}
		</>
	);
};
