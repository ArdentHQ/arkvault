import React, { useMemo } from "react";

import { TransactionAliases, TransactionDetailModalProperties } from "./TransactionDetailModal.contracts";
import { useWalletAlias, WalletAliasResult } from "@/app/hooks/use-wallet-alias";
import { MultiSignatureRegistrationDetail } from "@/domains/transaction/components/MultiSignatureDetail";
import { TransferDetail } from "@/domains/transaction/components/TransferDetail";

export const TransactionDetailModal = ({
	isOpen,
	transactionItem,
	profile,
	onClose,
}: TransactionDetailModalProperties) => {
	const { getWalletAlias } = useWalletAlias();

	const aliases: TransactionAliases | undefined = useMemo(() => {
		const sender = getWalletAlias({
			address: transactionItem.sender(),
			network: transactionItem.wallet().network(),
			profile,
		});

		const recipients: WalletAliasResult[] = [];

		if (transactionItem.isTransfer()) {
			recipients.push(
				getWalletAlias({
					address: transactionItem.recipient(),
					network: transactionItem.wallet().network(),
					profile,
				}),
			);
		}

		if (transactionItem.isMultiPayment()) {
			for (const recipient of transactionItem.recipients()) {
				recipients.push(
					getWalletAlias({
						address: recipient.address,
						network: transactionItem.wallet().network(),
						profile,
					}),
				);
			}
		}

		return { recipients, sender };
	}, [getWalletAlias, profile, transactionItem]);

	const transactionsDetail = {
		default: () => void 0,
		delegateRegistration: () => TransferDetail,
		delegateResignation: () => TransferDetail,
		ipfs: () => TransferDetail,
		magistrate: () => TransferDetail,
		multiPayment: () => TransferDetail,
		multiSignature: () => MultiSignatureRegistrationDetail,
		secondSignature: () => TransferDetail,
		transfer: () => TransferDetail,
		unlockToken: () => TransferDetail,
		unvote: () => TransferDetail,
		vote: () => TransferDetail,
		voteCombination: () => TransferDetail,
	};


	const transactionType = transactionItem.type();

	const TransactionModal = (
		transactionsDetail[transactionType as keyof typeof transactionsDetail] || transactionsDetail.default
	)();

	if (!TransactionModal) {
		throw new Error(`Transaction type [${transactionType}] is not supported.`);
	}

	return (
		<TransactionModal
			isOpen={isOpen}
			transaction={transactionItem}
			aliases={aliases}
			onClose={onClose}
			profile={profile}
		/>
	);
};
