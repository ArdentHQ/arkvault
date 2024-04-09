import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
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
		// @TODO: Use new icons for username registration & resignation types when available.
		// @see https://app.clickup.com/t/86dt6ymku
		usernameRegistration: {
			icon: "DelegateRegistration",
			label: t("TRANSACTION.TRANSACTION_TYPES.USERNAME_REGISTRATION"),
		},
		usernameResignation: {
			icon: "DelegateResignation",
			label: t("TRANSACTION.TRANSACTION_TYPES.USERNAME_RESIGNATION"),
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

	const mainsailUnsupportedTypes = new Set(["htlcClaim", "htlcLock", "htlcRefund", "ipfs", "secondSignature", "magistrate"]);

	const isMainsail = wallets.some((wallet) => wallet.network().coinName() === "Mainsail");

	return {
		canViewMagistrate: useMemo(
			() =>
				!isMainsail && wallets.some((wallet) =>
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

				const types = uniq(allSupportedTypes);

				if (isMainsail) {
					return types.filter((type) => !mainsailUnsupportedTypes.has(type));
				}

				return types;
				
			}, [wallets]),
			magistrate: [MagistrateTransactionType],
		},
	};
};
