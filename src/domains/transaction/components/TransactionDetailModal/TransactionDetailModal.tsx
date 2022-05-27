import React, { useMemo } from "react";

import { TransactionAliases, TransactionDetailModalProperties } from "./TransactionDetailModal.contracts";
import { useWalletAlias, WalletAliasResult } from "@/app/hooks/use-wallet-alias";
import { DelegateRegistrationDetail } from "@/domains/transaction/components/DelegateRegistrationDetail";
import { DelegateResignationDetail } from "@/domains/transaction/components/DelegateResignationDetail";
import { IpfsDetail } from "@/domains/transaction/components/IpfsDetail";
import { LegacyMagistrateDetail } from "@/domains/transaction/components/LegacyMagistrateDetail";
import { MultiPaymentDetail } from "@/domains/transaction/components/MultiPaymentDetail";
import { MultiSignatureRegistrationDetail } from "@/domains/transaction/components/MultiSignatureDetail";
import { SecondSignatureDetail } from "@/domains/transaction/components/SecondSignatureDetail";
import { TransferDetail } from "@/domains/transaction/components/TransferDetail";
import { UnlockTokenDetail } from "@/domains/transaction/components/UnlockTokenDetail";
import { VoteDetail } from "@/domains/transaction/components/VoteDetail";

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
		delegateRegistration: () => DelegateRegistrationDetail,
		delegateResignation: () => DelegateResignationDetail,
		ipfs: () => IpfsDetail,
		magistrate: () => LegacyMagistrateDetail,
		multiPayment: () => MultiPaymentDetail,
		multiSignature: () => MultiSignatureRegistrationDetail,
		secondSignature: () => SecondSignatureDetail,
		transfer: () => TransferDetail,
		unlockToken: () => UnlockTokenDetail,
		unvote: () => VoteDetail,
		vote: () => VoteDetail,
		voteCombination: () => VoteDetail,
	};

	const transactionType = transactionItem.type();

	// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
	const TransactionModal = (
		transactionsDetail[transactionType as keyof typeof transactionsDetail] || transactionsDetail.default
	)();

	if (!TransactionModal) {
		throw new Error(`Transaction type [${transactionType}] is not supported.`);
	}

	return <TransactionModal isOpen={isOpen} transaction={transactionItem} aliases={aliases} onClose={onClose} />;
};
