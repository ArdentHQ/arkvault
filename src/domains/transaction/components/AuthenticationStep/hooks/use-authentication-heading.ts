import React, { useMemo } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";

export const useAuthenticationHeading = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();
	const title = t("TRANSACTION.AUTHENTICATION_STEP.TITLE");

	const description = useMemo(() => {
		const requiresMnemonic = wallet.actsWithMnemonic() || wallet.actsWithAddress() || wallet.actsWithPublicKey();
		const requiresEncryptionPassword =
			wallet.actsWithMnemonicWithEncryption() ||
			wallet.actsWithWifWithEncryption() ||
			wallet.actsWithSecretWithEncryption();

		const requiresSecondMnemonic = wallet.isSecondSignature() && requiresMnemonic;
		const requiresSecondSecret = wallet.isSecondSignature() && wallet.actsWithSecret();

		if (wallet.actsWithWif()) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_WIF");
		}

		if (wallet.actsWithPrivateKey()) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_PRIVATE_KEY");
		}

		if (wallet.actsWithSecret()) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_SECRET");
		}

		if (requiresEncryptionPassword) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_ENCRYPTION_PASSWORD");
		}

		if (requiresMnemonic) {
			return t("TRANSACTION.AUTHENTICATION_STEP.DESCRIPTION_MNEMONIC");
		}

		if (requiresSecondMnemonic) {
			return t("TRANSACTION.SECOND_MNEMONIC");
		}

		if (requiresSecondSecret) {
			return t("TRANSACTION.SECOND_SECRET");
		}
	}, [wallet]);

	return {
		title,
		description,
	};
};
