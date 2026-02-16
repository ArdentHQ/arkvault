import { Contracts, DTO } from "@/app/lib/profiles";
import React, { ReactNode, useEffect, useState } from "react";
import { Address } from "@/app/components/Address";
import { useBreakpoint } from "@/app/hooks";
import { useTranslation } from "react-i18next";
import { useTransactionTypes } from "@/domains/transaction/hooks/use-transaction-types";

interface Properties {
	transaction: DTO.ExtendedConfirmedTransactionData;
	type: string;
	recipient: string;
	walletName?: string;
	addressClass?: string;
}

const RecipientLabel = ({ children }: { children: ReactNode }) => (
	<span data-testid="TransactionRowRecipientLabel" className="text-theme-text font-semibold">
		{children}
	</span>
);

const VoteCombinationLabel = ({
	validator,
	votes,
	unvotes,
}: {
	validator?: Contracts.IReadOnlyWallet;
	votes: string[];
	unvotes: string[];
}) => {
	const { t } = useTranslation();
	return (
		<span data-testid="TransactionRowVoteCombinationLabel">
			{votes.length === 1 && unvotes.length === 1 ? (
				<>
					<RecipientLabel>{t("TRANSACTION.TRANSACTION_TYPES.VOTE")}</RecipientLabel>
					<ValidatorLabel username={validator?.username()} />
				</>
			) : (
				<div className="space-x-1">
					<span className="inline-flex max-w-72">
						<RecipientLabel>{t("TRANSACTION.TRANSACTION_TYPES.VOTE")}</RecipientLabel>
						{votes.length > 1 && (
							<span className="text-theme-secondary-500 dark:text-theme-secondary-700 dim:text-theme-dim-500 ml-1 font-semibold">
								{votes.length}
							</span>
						)}
					</span>

					<span>/</span>

					<span>
						<RecipientLabel>{t("TRANSACTION.TRANSACTION_TYPES.UNVOTE")}</RecipientLabel>
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
};

const ValidatorLabel = ({ username, count }: { username?: string; count?: number }) => (
	<span className="border-theme-secondary-300 text-theme-secondary-500 dark:border-theme-secondary-800 dark:text-theme-secondary-700 ml-2 truncate border-l pl-2 font-semibold">
		{username}
		{count !== undefined && count > 1 && <span className="ml-1">+{count - 1}</span>}
	</span>
);

const VoteLabel = ({ validators, isUnvote }: { validators: Contracts.IReadOnlyWallet[]; isUnvote?: boolean }) => {
	const { t } = useTranslation();

	return (
		<span data-testid="TransactionRowVoteLabel">
			{!isUnvote && <RecipientLabel>{t("TRANSACTION.TRANSACTION_TYPES.VOTE")}</RecipientLabel>}
			{isUnvote && <RecipientLabel>{t("TRANSACTION.TRANSACTION_TYPES.UNVOTE")}</RecipientLabel>}
			{validators.length > 0 && <ValidatorLabel username={validators[0]?.username()} count={validators.length} />}
		</span>
	);
};

export const BaseTransactionRowRecipientLabel = ({
	transaction,
	type,
	recipient,
	walletName,
	addressClass,
}: Properties) => {
	const { isXs, isSm } = useBreakpoint();
	const { t } = useTranslation();
	const { getLabel } = useTransactionTypes();

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
				<RecipientLabel>{t("TRANSACTION.TRANSACTION_TYPES.PAY")}</RecipientLabel>
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

	return <RecipientLabel>{getLabel(transaction)}</RecipientLabel>;
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
