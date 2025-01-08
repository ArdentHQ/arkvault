import { uniq } from "@ardenthq/sdk-helpers";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TransactionTypeProperties {
	wallets?: Contracts.IReadWriteWallet[];
}

export const useTransactionTypes = ({ wallets = [] }: TransactionTypeProperties = {}) => {
	const { t } = useTranslation();

	const transactionTypes: Record<string, { label: string }> = {
		delegateRegistration: {
			label: t("TRANSACTION.TRANSACTION_TYPES.VALIDATOR_REGISTRATION"),
		},
		delegateResignation: {
			label: t("TRANSACTION.TRANSACTION_TYPES.VALIDATOR_RESIGNATION"),
		},
		htlcClaim: {
			label: t("TRANSACTION.TRANSACTION_TYPES.HTLC_CLAIM"),
		},
		htlcLock: {
			label: t("TRANSACTION.TRANSACTION_TYPES.HTLC_LOCK"),
		},
		htlcRefund: {
			label: t("TRANSACTION.TRANSACTION_TYPES.HTLC_REFUND"),
		},
		multiPayment: {
			label: t("TRANSACTION.TRANSACTION_TYPES.MULTI_PAYMENT"),
		},
		multiSignature: {
			label: t("TRANSACTION.TRANSACTION_TYPES.MULTI_SIGNATURE"),
		},
		transfer: {
			label: t("TRANSACTION.TRANSACTION_TYPES.TRANSFER"),
		},
		unvote: {
			label: t("TRANSACTION.TRANSACTION_TYPES.UNVOTE"),
		},
		usernameRegistration: {
			label: t("TRANSACTION.TRANSACTION_TYPES.USERNAME_REGISTRATION"),
		},
		usernameResignation: {
			label: t("TRANSACTION.TRANSACTION_TYPES.USERNAME_RESIGNATION"),
		},
		vote: {
			label: t("TRANSACTION.TRANSACTION_TYPES.VOTE"),
		},
		voteCombination: {
			label: t("TRANSACTION.TRANSACTION_TYPES.VOTE_COMBINATION"),
		},
	};

	return {
		getLabel: (type: string) => {
			if (transactionTypes[type]) {
				return transactionTypes[type].label;
			}

			return type;
		},
		types: {
			core: useMemo(() => {
				const allSupportedTypes: string[] = [];

				for (const wallet of wallets) {
					allSupportedTypes.push(
						...(wallet.transactionTypes() as string[]).filter(
							(type) => !["ipfs", "secondSignature"].includes(type),
						),
					);
				}

				return uniq(allSupportedTypes);
			}, [wallets]),
		},
	};
};
