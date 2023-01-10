import { useMemo } from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import { useTranslation } from "react-i18next";

export const useAuthenticationHeading = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();

	const title = wallet.isLedger()
		? t("MIGRATION.MIGRATION_ADD.STEP_AUTHENTICATION.CONFIRM_TRANSACTION")
		: t("TRANSACTION.AUTHENTICATION_STEP.TITLE");

	const description = useMemo(() => {
		const requiresMnemonic = wallet.actsWithMnemonic() || wallet.actsWithAddress() || wallet.actsWithPublicKey();

		const requiresEncryptionPassword =
			wallet.actsWithMnemonicWithEncryption() ||
			wallet.actsWithWifWithEncryption() ||
			wallet.actsWithSecretWithEncryption();

		if (wallet.actsWithWif()) {
			return t("MIGRATION.MIGRATION_ADD.STEP_AUTHENTICATION.DESCRIPTION_WIF");
		}

		if (wallet.actsWithPrivateKey()) {
			return t("MIGRATION.MIGRATION_ADD.STEP_AUTHENTICATION.DESCRIPTION_PRIVATE_KEY");
		}

		if (wallet.actsWithSecret()) {
			return t("MIGRATION.MIGRATION_ADD.STEP_AUTHENTICATION.DESCRIPTION_SECRET");
		}

		if (requiresEncryptionPassword) {
			return t("MIGRATION.MIGRATION_ADD.STEP_AUTHENTICATION.DESCRIPTION_ENCRYPTION_PASSWORD");
		}

		if (requiresMnemonic) {
			return t("MIGRATION.MIGRATION_ADD.STEP_AUTHENTICATION.DESCRIPTION_MNEMONIC");
		}
	}, [wallet]);

	return {
		description,
		title,
	};
};
