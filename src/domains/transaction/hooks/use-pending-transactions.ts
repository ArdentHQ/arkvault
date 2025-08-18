import { useCallback } from "react";
import { DTO } from "@/app/lib/profiles";
import { useLocalStorage } from "usehooks-ts";
import { BigNumber } from "@/app/lib/helpers";
import type { PendingPersistedJSON, UnconfirmedTransaction } from "@/app/lib/mainsail/pending-transaction.contract";
import {
	PendingTransactionData as PendingDTO
} from "@/app/lib/mainsail/pending-transaction.dto";
import { Contracts } from "@/app/lib/profiles";

export const usePendingTransactions = () => {
	const [pendingJson, setPendingJson] = useLocalStorage<PendingPersistedJSON[]>("pending-transactions", []);

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
				const dto = new PendingDTO()
					.configure({
						data: input.data as any,
						from: input.from,
						gas: Number(input.gasPrice ?? 0),
						gasLimit: input.gasLimit ? Number(input.gasLimit) : undefined,
						gasPrice: Number(input.gasPrice ?? 0),
						hash: input.hash,
						network: Number(input.networkId),
						nonce: input.nonce,
						r: "",
						s: "",
						senderPublicKey: input.walletAddress,
						to: input.to,
						v: 0,
						value: input.value,
					})
					.withDecimals(input.decimals);

				dto.setMeta("address", input.walletAddress);
				dto.setMeta("networkId", input.networkId);
				dto.setMeta("explorerLink", input.explorerLink ?? "");

				const json = dto.toPersistedJSON();

				setPendingJson((prev) => {
					const filtered = prev.filter((p) => p.hash !== json.hash);
					return [...filtered, json];
				});
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add unconfirmed pending transaction:", error);
			}
		},
		[setPendingJson],
	);

	const addPendingTransaction = useCallback(
		(transaction: DTO.ExtendedSignedTransactionData) => {
			try {
				const input = {
					data: transaction.data().data().data,
					explorerLink: transaction.explorerLink(),
					from: transaction.from(),
					hash: transaction.hash(),
					networkId: transaction.wallet().networkId(),
					nonce: transaction.nonce(),
					to: transaction.to(),
					value: transaction.value(),
					walletAddress: transaction.wallet().address(),
				};

				addPendingTransactionFromUnconfirmed(input as any);
			} catch (error) {
				/* istanbul ignore next -- @preserve */
				console.error("Failed to add pending transaction:", error);
			}
		},
		[addPendingTransactionFromUnconfirmed],
	);

	const removePendingTransaction = useCallback(
		(hash: string) => {
			setPendingJson((prev) => prev.filter((p) => p.hash !== hash));
		},
		[setPendingJson],
	);

	const buildPendingForUI = useCallback(
		(walletAddresses: string[], wallets: Contracts.IReadWriteWallet[]) => {
			const dtos = pendingJson.map(PendingDTO.fromPersistedJSON);

			return dtos.map((dto) => {
				const wallet = wallets.find((w) => w.address() === dto.getMeta("address"));
				const isReceived = walletAddresses.includes(dto.to());
				const isSent = walletAddresses.includes(dto.from());

				return {
					blockHash: () => { },
					confirmations: () => BigNumber.make(0),
					convertedAmount: () => 0,
					convertedTotal: () => 0,
					explorerLink: () => dto.getMeta<string>("explorerLink") ?? "",
					fee: () => dto.fee(),
					from: () => dto.from(),
					hash: () => dto.hash(),
					isConfirmed: () => false,
					isFailed: () => false,
					isMultiPayment: () => dto.isMultiPayment(),
					isPending: () => true,
					isReceived: () => isReceived,
					isReturn: () => dto.isReturn(),
					isSent: () => isSent,
					isSuccess: () => false,
					isTransfer: () => dto.isTransfer(),
					isUnvote: () => dto.isUnvote(),
					isUpdateValidator: () => dto.isUpdateValidator(),
					isUsernameRegistration: () => dto.isUsernameRegistration(),
					isUsernameResignation: () => dto.isUsernameResignation(),
					isValidatorRegistration: () => dto.isValidatorRegistration(),
					isValidatorResignation: () => dto.isValidatorResignation(),
					isVote: () => dto.isVote(),
					isVoteCombination: () => dto.isVoteCombination(),
					network: () => wallet?.network(),
					nonce: () => BigNumber.make(dto.nonce()),
					recipients: () => dto.recipients(),
					timestamp: () => dto.timestamp(),
					to: () => dto.to(),
					total: () => dto.value(),
					type: () => dto.type(),
					value: () => dto.value(),
					wallet: () => wallet,
				};
			});
		},
		[pendingJson],
	);

	return {
		addPendingTransaction,
		addPendingTransactionFromUnconfirmed,
		buildPendingForUI,
		pendingJson,
		removePendingTransaction,
	};
};
