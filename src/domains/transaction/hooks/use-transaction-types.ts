import { uniq } from "@payvo/sdk-helpers";
import { Contracts } from "@payvo/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TransactionTypeProperties {
	wallets?: Contracts.IReadWriteWallet[];
}

const MagistrateTransactionType = "magistrate";

export const useTransactionTypes = ({ wallets = [] }: TransactionTypeProperties = {}) => {
	const { t } = useTranslation();

	const transactionTypes: Record<string, { icon: string; label: string }> = {
		delegateRegistration: {
			icon: "DelegateRegistration",
			label: t("TRANSACTION.TRANSACTION_TYPES.DELEGATE_REGISTRATION"),
		},
		delegateResignation: {
			icon: "DelegateResignation",
			label: t("TRANSACTION.TRANSACTION_TYPES.DELEGATE_RESIGNATION"),
		},
		htlcClaim: {
			icon: "Timelock",
			label: t("TRANSACTION.TRANSACTION_TYPES.HTLC_CLAIM"),
		},
		htlcLock: {
			icon: "Timelock",
			label: t("TRANSACTION.TRANSACTION_TYPES.HTLC_LOCK"),
		},
		htlcRefund: {
			icon: "Timelock",
			label: t("TRANSACTION.TRANSACTION_TYPES.HTLC_REFUND"),
		},
		ipfs: {
			icon: "Ipfs",
			label: t("TRANSACTION.TRANSACTION_TYPES.IPFS"),
		},
		magistrate: {
			icon: "Magistrate",
			label: t("TRANSACTION.TRANSACTION_TYPES.MAGISTRATE"),
		},
		multiPayment: {
			icon: "Multipayment",
			label: t("TRANSACTION.TRANSACTION_TYPES.MULTI_PAYMENT"),
		},
		multiSignature: {
			icon: "Multisignature",
			label: t("TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE"),
		},
		secondSignature: {
			icon: "SecondSignature",
			label: t("TRANSACTION.TRANSACTION_TYPES.SECOND_SIGNATURE"),
		},
		transfer: {
			icon: "Transfer",
			label: t("TRANSACTION.TRANSACTION_TYPES.TRANSFER"),
		},
		unlockToken: {
			icon: "UnlockToken",
			label: t("TRANSACTION.TRANSACTION_TYPES.UNLOCK_TOKEN"),
		},
		unvote: {
			icon: "Unvote",
			label: t("TRANSACTION.TRANSACTION_TYPES.UNVOTE"),
		},
		vote: {
			icon: "Vote",
			label: t("TRANSACTION.TRANSACTION_TYPES.VOTE"),
		},
		voteCombination: {
			icon: "VoteCombination",
			label: t("TRANSACTION.TRANSACTION_TYPES.VOTE_COMBINATION"),
		},
	};

	return {
		canViewMagistrate: useMemo(
			() =>
				wallets.some((wallet) =>
					(wallet.transactionTypes() as string[]).filter((type) => type === MagistrateTransactionType),
				),
			[wallets],
		),
		getIcon: (type: string): string => transactionTypes[type].icon,
		getLabel: (type: string): string => transactionTypes[type].label,
		types: {
			core: useMemo(() => {
				const allSupportedTypes: string[] = [];

				for (const wallet of wallets) {
					allSupportedTypes.push(
						...(wallet.transactionTypes() as string[]).filter((type) => type !== MagistrateTransactionType),
					);
				}

				return uniq(allSupportedTypes);
			}, [wallets]),
			magistrate: [MagistrateTransactionType],
		},
	};
};
