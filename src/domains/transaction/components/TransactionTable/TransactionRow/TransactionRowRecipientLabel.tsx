import { Contracts, DTO } from "@/app/lib/profiles";
import React, { useEffect, useState } from "react";

import { Address } from "@/app/components/Address";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { useBreakpoint } from "@/app/hooks";

interface Properties {
	transaction?: DTO.ExtendedConfirmedTransactionData;
	type: string;
	recipient: string;
	walletName?: string;
	addressClass?: string;
}

const RecipientLabel = ({ type }: { type: string }) => {
	const { getLabel } = useTransactionTypes();
	return (
		<span data-testid="TransactionRowRecipientLabel" className="text-theme-text font-semibold">
			{getLabel(type)}
		</span>
	);
};

const VoteCombinationLabel = ({
	validator,
	votes,
	unvotes,
}: {
	validator?: Contracts.IReadOnlyWallet;
	votes: string[];
	unvotes: string[];
}) => (
	<span data-testid="TransactionRowVoteCombinationLabel">
		{votes.length === 1 && unvotes.length === 1 ? (
			<>
				<RecipientLabel type="voteCombination" />
				<ValidatorLabel username={validator?.username()} />
			</>
		) : (
			<div className="space-x-1">
				<span className="inline-flex max-w-72">
					<RecipientLabel type="vote" />
					{votes.length > 1 && (
						<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-500 ml-1 font-semibold">
							{votes.length}
						</span>
					)}
				</span>

				<span>/</span>

				<span>
					<RecipientLabel type="unvote" />
					{unvotes.length > 1 && (
						<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-500 ml-1 font-semibold">
							{unvotes.length}
						</span>
					)}
				</span>
			</div>
		)}
	</span>
);

const ValidatorLabel = ({ username, count }: { username?: string; count?: number }) => (
	<span className="border-theme-secondary-300 text-theme-secondary-500 dark:border-theme-secondary-800 dark:text-theme-secondary-700 ml-2 truncate border-l pl-2 font-semibold">
		{username}
		{count !== undefined && count > 1 && <span className="ml-1">+{count - 1}</span>}
	</span>
);

const VoteLabel = ({ validators, isUnvote }: { validators: Contracts.IReadOnlyWallet[]; isUnvote?: boolean }) => (
	<span data-testid="TransactionRowVoteLabel">
		<RecipientLabel type={isUnvote ? "unvote" : "vote"} />
		{validators.length > 0 && <ValidatorLabel username={validators[0]?.username()} count={validators.length} />}
	</span>
);

export const BaseTransactionRowRecipientLabel = ({
	transaction,
	type,
	recipient,
	walletName,
	addressClass,
}: Properties) => {
	const { isXs, isSm } = useBreakpoint();

	const [validators, setValidators] = useState<{
		votes: Contracts.IReadOnlyWallet[];
		unvotes: Contracts.IReadOnlyWallet[];
	}>({
		unvotes: [],
		votes: [],
	});

	useEffect(() => {
		if (transaction?.isVote() || transaction?.isUnvote()) {
			setValidators({
				unvotes: transaction.wallet().validators().map(transaction.wallet(), transaction.unvotes()),
				votes: transaction.wallet().validators().map(transaction.wallet(), transaction.votes()),
			});
		}
	}, [transaction]);

	if (type === "transfer") {
		return (
			<Address
				walletName={walletName}
				address={recipient}
				addressClass={addressClass}
				alignment={isXs || isSm ? "right" : undefined}
			/>
		);
	}

	if (transaction?.isMultiPayment()) {
		return (
			<span>
				<RecipientLabel type="multiPayment" />
				<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-50 ml-1 font-semibold">
					{transaction.recipients().length}
				</span>
			</span>
		);
	}

	if (transaction?.isVoteCombination()) {
		return (
			<VoteCombinationLabel
				validator={validators.votes[0]}
				votes={transaction.votes()}
				unvotes={transaction.unvotes()}
			/>
		);
	}

	if (transaction?.isVote() || transaction?.isUnvote()) {
		return (
			<VoteLabel
				validators={validators[transaction.isVote() ? "votes" : "unvotes"]}
				isUnvote={transaction.isUnvote()}
			/>
		);
	}

	return <RecipientLabel type={type} />;
};

export const TransactionRowRecipientLabel = ({
	transaction,
	walletName,
	addressClass,
}: {
	transaction: DTO.ExtendedConfirmedTransactionData;
	walletName?: string;
	addressClass?: string;
}) => (
	<BaseTransactionRowRecipientLabel
		transaction={transaction}
		type={transaction.type()}
		recipient={transaction.to()}
		walletName={walletName}
		addressClass={addressClass}
	/>
);
