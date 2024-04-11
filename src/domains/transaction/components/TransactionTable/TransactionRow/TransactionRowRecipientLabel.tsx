import { Contracts, DTO } from "@ardenthq/sdk-profiles";
import React, { useEffect, useState } from "react";

import { useResizeDetector } from "react-resize-detector";
import { Networks } from "@ardenthq/sdk";
import { Address } from "@/app/components/Address";
import { useEnvironmentContext } from "@/app/contexts";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";
import { useBreakpoint } from "@/app/hooks";

import { TruncateMiddleDynamic } from "@/app/components/TruncateMiddleDynamic";

interface Properties {
	transaction?: DTO.ExtendedConfirmedTransactionData;
	type: string;
	recipient: string;
	walletName?: string;
	addressClass?: string;
	network: Networks.Network;
}

const RecipientLabel = ({ type, network }: { type: string, network: Networks.Network }) => {
	const { getLabel } = useTransactionTypes();
	return (
		<span data-testid="TransactionRowRecipientLabel" className="font-semibold text-theme-text">
			{getLabel(type, network)}
		</span>
	);
};

const VoteCombinationLabel = ({
	network,
	delegate,
	votes,
	unvotes,
}: {
	network: Networks.Network;
	delegate?: Contracts.IReadOnlyWallet;
	votes: string[];
	unvotes: string[];
}) => (
	<span data-testid="TransactionRowVoteCombinationLabel" className="overflow-auto´ flex max-w-full flex-1">
		{votes.length === 1 && unvotes.length === 1 ? (
			<>
				<RecipientLabel type="voteCombination" network={network} />
				<DelegateLabel username={delegate?.username()} address={delegate?.address()} />
			</>
		) : (
			<div className="space-x-1">
				<span className="inline-flex max-w-72">
					<RecipientLabel type="vote" network={network} />
					{votes.length > 1 && (
						<span className="ml-1 font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
							{votes.length}
						</span>
					)}
				</span>

				<span>/</span>

				<span>
					<RecipientLabel type="unvote" network={network} />
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

const DelegateLabel = ({ username, address, count }: { username?: string; address?: string; count?: number }) => {
	const { ref, width } = useResizeDetector<HTMLSpanElement>({ handleHeight: false });
	return (
		<span className="ml-2 flex flex-1 truncate border-l border-theme-secondary-300 pl-2 font-semibold text-theme-secondary-500 dark:border-theme-secondary-800 dark:text-theme-secondary-700">
			{username == undefined && address != undefined ? (
				<span ref={ref} className="max-w-full flex-1">
					<TruncateMiddleDynamic value={address} availableWidth={width} />
				</span>
			) : (
				username
			)}

			{count !== undefined && count > 1 && <span className="ml-1">+{count - 1}</span>}
		</span>
	);
};

const VoteLabel = ({ delegates, isUnvote, network }: { delegates: Contracts.IReadOnlyWallet[]; isUnvote?: boolean, network: Networks.Network }) => (
	<span data-testid="TransactionRowVoteLabel" className="flex">
		<RecipientLabel type={isUnvote ? "unvote" : "vote"} network={network} />
		{delegates.length > 0 && (
			<DelegateLabel
				username={delegates[0]?.username()}
				address={delegates[0].address()}
				count={delegates.length}
			/>
		)}
	</span>
);

export const BaseTransactionRowRecipientLabel = ({
	transaction,
	type,
	recipient,
	walletName,
	addressClass,
	network
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
				<RecipientLabel type="multiPayment" network={network} />
				<span className="ml-1 font-semibold text-theme-secondary-500 dark:text-theme-secondary-700">
					{transaction.recipients().length}
				</span>
			</span>
		);
	}

	if (transaction?.isVoteCombination()) {
		return (
			<VoteCombinationLabel
				delegate={delegates.votes[0]!}
				votes={transaction.votes()}
				unvotes={transaction.unvotes()}
				network={network}
			/>
		);
	}

	if (transaction?.isVote() || transaction?.isUnvote()) {
		return (
			<VoteLabel
				delegates={delegates[transaction.isVote() ? "votes" : "unvotes"]}
				isUnvote={transaction.isUnvote()}
				network={network}
			/>
		);
	}

	return <RecipientLabel type={type} network={network} />;
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
		network={transaction.wallet().network()}
	/>
);
