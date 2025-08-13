import { useCallback } from "react";
import { DTO } from "@/app/lib/profiles";
import { useLocalStorage } from "usehooks-ts";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import type { UnconfirmedTransaction } from "@/app/lib/mainsail/pending-transaction.contract";
import { PendingTransactionData as PendingDTO } from "@/app/lib/mainsail/pending-transaction.dto";

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
	nonce: string | number;
	recipients?: DTO.ExtendedTransactionRecipient[];
	timestamp: DateTime | number;
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

	addPendingTransactionFromUnconfirmed: (input: {
		from: UnconfirmedTransaction["from"];
		to: UnconfirmedTransaction["to"];
		hash: UnconfirmedTransaction["hash"];
		value: UnconfirmedTransaction["value"];
		nonce: UnconfirmedTransaction["nonce"];
		data: UnconfirmedTransaction["data"];
		gasPrice?: string | number;
		gasLimit?: string | number;
		decimals?: number | string;
		walletAddress: string;
		networkId: string;
		explorerLink?: string;
	}) => void;
}

export const usePendingTransactions = (): UsePendingTransactionsReturn => {
	const [pendingTransactions, setPendingTransactions] = useLocalStorage<PendingTransactionData[]>(
		"pending-transactions",
		[],
	);

	const addPendingTransaction = useCallback(
		(transaction: DTO.ExtendedSignedTransactionData) => {
			try {
				const pending: PendingTransactionData = {
					convertedAmount: transaction.convertedAmount?.(),
					convertedTotal: transaction.convertedTotal(),
					explorerLink: transaction.explorerLink(),
					fee: Number(transaction.fee()),
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
					nonce: (transaction.nonce?.() as unknown as BigNumber)?.toString?.() ?? String(transaction.nonce?.()),
					recipients: transaction.recipients?.(),
					timestamp: DateTime.make(transaction.timestamp()).toUNIX(),
					to: transaction.to(),
					total: Number(transaction.total()),
					type: transaction.type(),
					value: Number(transaction.value()),
					walletAddress: transaction.wallet().address(),
				};

				setPendingTransactions((prev) => {
					const filtered = prev.filter((tx) => tx.hash !== transaction.hash());
					return [...filtered, pending];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add pending transaction:", error);
			}
		},
		[setPendingTransactions],
	);

	const addPendingTransactionFromUnconfirmed = useCallback(
		(input: {
			from: UnconfirmedTransaction["from"];
			to: UnconfirmedTransaction["to"];
			hash: UnconfirmedTransaction["hash"];
			value: UnconfirmedTransaction["value"];
			nonce: UnconfirmedTransaction["nonce"];
			data: UnconfirmedTransaction["data"];
			gasPrice?: string | number;
			gasLimit?: string | number;
			decimals?: number | string;
			walletAddress: string;
			networkId: string;
			explorerLink?: string;
		}) => {
			try {
				const dto = new PendingDTO().configure({
					network: 0,
					from: input.from,
					to: input.to,
					hash: input.hash,
					value: String(input.value),
					nonce: String(input.nonce),
					data: input.data ?? "",
					gasPrice: Number(input.gasPrice ?? 0),
					gas: Number(input.gasLimit ?? 0),
					v: 0,
					r: "",
					s: "",
					senderPublicKey: "",
					gasLimit: input.gasLimit ? Number(input.gasLimit) : undefined,
				}).withDecimals(input.decimals);

				dto.setMeta("address", input.walletAddress);
				dto.setMeta("networkId", input.networkId);
				dto.setMeta("explorerLink", input.explorerLink ?? "");

				const pending: PendingTransactionData = {
					convertedAmount: 0,
					convertedTotal: 0,
					explorerLink: input.explorerLink ?? "",
					fee: dto.fee().toNumber(),
					from: dto.from(),
					hash: dto.hash(),
					isMultiPayment: dto.isMultiPayment(),
					isReturn: dto.isReturn(),
					isTransfer: dto.isTransfer(),
					isUnvote: dto.isUnvote(),
					isUpdateValidator: dto.isUpdateValidator(),
					isUsernameRegistration: dto.isUsernameRegistration(),
					isUsernameResignation: dto.isUsernameResignation(),
					isValidatorRegistration: dto.isValidatorRegistration(),
					isValidatorResignation: dto.isValidatorResignation(),
					isVote: dto.isVote(),
					isVoteCombination: dto.isVoteCombination(),
					networkId: input.networkId,
					nonce: String(input.nonce),
					recipients: dto.recipients(),
					timestamp: Date.now(),
					to: dto.to(),
					total: dto.value().toNumber(),
					type: dto.type(),
					value: dto.value().toNumber(),
					walletAddress: input.walletAddress,
				};

				setPendingTransactions((prev) => {
					const filtered = prev.filter((tx) => tx.hash !== input.hash);
					return [...filtered, pending];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add unconfirmed pending transaction:", error);
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
		addPendingTransactionFromUnconfirmed,
		pendingTransactions,
		removePendingTransaction,
	};
};
