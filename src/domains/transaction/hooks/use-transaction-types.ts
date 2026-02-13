import { Contracts, DTO } from "@/app/lib/profiles";
import { uniq, constantCase } from "@/app/lib/helpers";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { isContractDeployment } from "../utils";

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
		getLabel: (transaction: DTO.ExtendedConfirmedTransactionData | DTO.ExtendedSignedTransactionData) => {
			const type = transaction.type()
			const translationKey = `TRANSACTION.TRANSACTION_TYPES.${constantCase(nameMap[type] || type)}`;

			// check if the key exists in the translations
			if (i18n.exists(translationKey)) {
				return t(translationKey);
			}

			if (isContractDeployment(transaction)) {
				return t("TRANSACTION.TRANSACTION_TYPES.CONTRACT_DEPLOYMENT");
			}

			return transaction.type()
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
