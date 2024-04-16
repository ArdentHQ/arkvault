import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Networks } from "@ardenthq/sdk";
import { selectDelegateValidatorTranslation } from "@/domains/wallet/utils/selectDelegateValidatorTranslation";
import { isMainsailNetwork } from "@/utils/network-utils";

interface TransactionTypeProperties {
	wallets?: Contracts.IReadWriteWallet[];
}

const MagistrateTransactionType = "magistrate";

export const useTransactionTypes = ({ wallets = [] }: TransactionTypeProperties = {}) => {
	const { t } = useTranslation();

	const transactionTypes: Record<string, { icon: string; label: string | ((network: Networks.Network) => string) }> =
		{
			delegateRegistration: {
				icon: "DelegateRegistration",
				label: (network) =>
					selectDelegateValidatorTranslation({
						delegateStr: t("TRANSACTION.TRANSACTION_TYPES.DELEGATE_REGISTRATION"),
						network,
						validatorStr: t("TRANSACTION.TRANSACTION_TYPES.VALIDATOR_REGISTRATION"),
					}),
			},
			delegateResignation: {
				icon: "DelegateResignation",
				label: (network) =>
					selectDelegateValidatorTranslation({
						delegateStr: t("TRANSACTION.TRANSACTION_TYPES.DELEGATE_RESIGNATION"),
						network,
						validatorStr: t("TRANSACTION.TRANSACTION_TYPES.VALIDATOR_RESIGNATION"),
					}),
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
			usernameRegistration: {
				icon: "UsernameRegistration",
				label: t("TRANSACTION.TRANSACTION_TYPES.USERNAME_REGISTRATION"),
			},
			usernameResignation: {
				icon: "UsernameResignation",
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

	const getLabel = (type: string, network: Networks.Network): string => {
		const label = transactionTypes[type].label;

		if (typeof label === "function") {
			return label(network);
		}

		return label;
	};

	return {
		canViewMagistrate: wallets.some((wallet) => !isMainsailNetwork(wallet.network())),
		getIcon: (type: string): string => transactionTypes[type].icon,
		getLabel,
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
