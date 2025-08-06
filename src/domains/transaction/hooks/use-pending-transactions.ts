import { useCallback } from "react";
import { DTO } from "@/app/lib/profiles";
import { useLocalStorage } from "usehooks-ts";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";

interface PendingTransactionData {
	convertedAmount: number;
	convertedTotal: number;
	explorerLink: string;
	fee: number;
	from: string;
	hash: string;
	isMultiPayment: boolean;
	isReturn: boolean;
	isTransfer: boolean;
	isUsernameRegistration: boolean;
	isUsernameResignation: boolean;
	isUnvote: boolean;
	isUpdateValidator: boolean;
	isValidatorResignation: boolean;
	isValidatorRegistration: boolean;
	isVote: boolean;
	isVoteCombination: boolean;
	networkId: string;
	nonce: BigNumber;
	recipients?: DTO.ExtendedTransactionRecipient[];
	timestamp: DateTime;
	to: string;
	total: number;
	type: string;
	value: number;
	walletAddress: string;
}

interface UsePendingTransactionsReturn {
	pendingTransactions: PendingTransactionData[];
	addPendingTransaction: (transaction: DTO.ExtendedSignedTransactionData) => void;
	removePendingTransaction: (hash: string) => void;
}

export const usePendingTransactions = (): UsePendingTransactionsReturn => {
	const [pendingTransactions, setPendingTransactions] = useLocalStorage<PendingTransactionData[]>(
		"pending-transactions",
		[],
	);

	const addPendingTransaction = useCallback(
		(transaction: DTO.ExtendedSignedTransactionData) => {
			try {
				const pendingTransaction: PendingTransactionData = {
					convertedAmount: transaction.convertedAmount?.(),
					convertedTotal: transaction.convertedTotal(),
					explorerLink: transaction.explorerLink(),
					fee: transaction.fee(),
					from: transaction.from(),
					hash: transaction.hash(),
					isMultiPayment: transaction.isMultiPayment(),
					isReturn: transaction.isReturn(),
					isTransfer: transaction.isTransfer(),
					isUnvote: transaction.isUnvote(),
					isUpdateValidator: transaction.isUpdateValidator(),
					isUsernameRegistration: transaction.isUsernameRegistration(),
					isUsernameResignation: transaction.isUsernameResignation(),
					isValidatorRegistration: transaction.isValidatorRegistration(),
					isValidatorResignation: transaction.isValidatorResignation(),
					isVote: transaction.isVote(),
					isVoteCombination: transaction.isVoteCombination(),
					networkId: transaction.wallet().networkId(),
					nonce: transaction.nonce(),
					recipients: transaction.recipients?.(),
					timestamp: DateTime.make(transaction.timestamp()),
					to: transaction.to(),
					total: transaction.total(),
					type: transaction.type(),
					value: transaction.value(),
					walletAddress: transaction.wallet().address(),
				};

				setPendingTransactions((prev) => {
					const filtered = prev.filter((tx) => tx.hash !== transaction.hash());
					return [...filtered, pendingTransaction];
				});
			} catch (error) {
				console.error("Failed to add pending transaction:", error);
			}
		},
		[setPendingTransactions],
	);

	const removePendingTransaction = useCallback(
		(hash: string) => {
			setPendingTransactions((prev) => prev.filter((tx) => tx.hash !== hash));
		},
		[setPendingTransactions],
	);

	return {
		addPendingTransaction,
		pendingTransactions,
		removePendingTransaction,
	};
};
