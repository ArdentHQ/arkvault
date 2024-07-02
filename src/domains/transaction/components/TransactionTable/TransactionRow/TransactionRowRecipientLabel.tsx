import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";

import { Address } from "@/app/components/Address";
import { useEnvironmentContext } from "@/app/contexts";
import { useBreakpoint } from "@/app/hooks";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

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
		<span data-testid="TransactionRowRecipientLabel" className="font-semibold text-theme-text">
			{getLabel(type)}
		</span>
	);
};

const VoteCombinationLabel = ({
	delegate,
	votes,
	unvotes,
}: {
	delegate?: Contracts.IReadOnlyWallet;
	votes: string[];
	unvotes: string[];
}) => (
	<span data-testid="TransactionRowVoteCombinationLabel">
		{votes.length === 1 && unvotes.length === 1 ? (
			<>
				<RecipientLabel type="voteCombination" />
				<DelegateLabel username={delegate?.username()} />
			</>
		) : (
			<div className="space-x-1">
				<span className="inline-flex max-w-72">
					<RecipientLabel type="vote" />
					{votes.length > 1 && (
						<span className="ml-1 font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{votes.length}
						</span>
					)}
				</span>

				<span>/</span>

				<span>
					<RecipientLabel type="unvote" />
					{unvotes.length > 1 && (
						<span className="ml-1 font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{unvotes.length}
						</span>
					)}
				</span>
			</div>
		)}
	</span>
);

const DelegateLabel = ({ username, count }: { username?: string; count?: number }) => (
	<span className="ml-2 truncate border-l border-theme-secondary-300 pl-2 font-semibold text-theme-secondary-500 dark:border-theme-secondary-800 dark:text-theme-secondary-700">
		{username}
		{count !== undefined && count > 1 && <span className="ml-1">+{count - 1}</span>}
	</span>
);

const VoteLabel = ({ delegates, isUnvote }: { delegates: Contracts.IReadOnlyWallet[]; isUnvote?: boolean }) => (
	<span data-testid="TransactionRowVoteLabel">
		<RecipientLabel type={isUnvote ? "unvote" : "vote"} />
		{delegates.length > 0 && <DelegateLabel username={delegates[0]?.username()} count={delegates.length} />}
	</span>
);

export const BaseTransactionRowRecipientLabel = ({
	transaction,
	type,
	recipient,
	walletName,
	addressClass,
}: Properties) => {
	const { env } = useEnvironmentContext();

	const { isXs, isSm } = useBreakpoint();

	const [delegates, setDelegates] = useState<{
		votes: Contracts.IReadOnlyWallet[];
		unvotes: Contracts.IReadOnlyWallet[];
	}>({
		unvotes: [],
		votes: [],
	});

	useEffect(() => {
		if (transaction?.isVote() || transaction?.isUnvote()) {
			setDelegates({
				unvotes: env.delegates().map(transaction.wallet(), transaction.unvotes()),
				votes: env.delegates().map(transaction.wallet(), transaction.votes()),
			});
		}
	}, [env, transaction]);

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
				<span className="ml-1 font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					{transaction?.recipients().length}
				</span>
			</span>
		);
	}

	if (transaction?.isVoteCombination()) {
		return (
			<VoteCombinationLabel
				delegate={delegates.votes[0]}
				votes={transaction?.votes()}
				unvotes={transaction?.unvotes()}
			/>
		);
	}

	if (transaction?.isVote() || transaction?.isUnvote()) {
		return (
			<VoteLabel
				delegates={delegates[transaction?.isVote() ? "votes" : "unvotes"]}
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
		recipient={transaction.recipient()}
		walletName={walletName}
		addressClass={addressClass}
	/>
);
