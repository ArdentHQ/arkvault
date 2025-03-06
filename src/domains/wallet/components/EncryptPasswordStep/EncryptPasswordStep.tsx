import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { PasswordValidation } from "@/app/components/PasswordValidation";

export const EncryptPasswordStep = () => {
	const { t } = useTranslation();

	return (
		<section data-testid="EncryptPassword">
			<Alert className="mt-4" variant="warning">
				<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.WARNING" />
			</Alert>

			<div className="space-y-4 pt-4">
				<PasswordValidation
					passwordField="encryptionPassword"
					passwordFieldLabel={t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.PASSWORD_LABEL")}
					confirmPasswordField="confirmEncryptionPassword"
					confirmPasswordFieldLabel={t(
						"WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.CONFIRM_PASSWORD_LABEL",
					)}
					optional={false}
				/>
			</div>
		</section>
	);
};
