import { Contracts } from "@/app/lib/profiles";
import { uniq, constantCase } from "@/app/lib/helpers";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

interface TransactionTypeProperties {
	wallets?: Contracts.IReadWriteWallet[];
}

export const useTransactionTypes = ({ wallets = [] }: TransactionTypeProperties = {}) => {
	const { t, i18n } = useTranslation();

	const nameMap = {
		multiPayment: "pay",
		usernameRegistration: "registerUsername",
		usernameResignation: "resignUsername",
		validatorRegistration: "registerValidator",
		validatorResignation: "resignValidator",
	};

	return {
		getLabel: (type: string) => {
			if (type.startsWith("0x")) {
				return type;
			}

			const translationKey = `TRANSACTION.TRANSACTION_TYPES.${constantCase(nameMap[type] || type)}`;

			// check if the key exists in the translations
			if (i18n.exists(translationKey)) {
				return t(translationKey);
			}

			return t("TRANSACTION.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT");
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
