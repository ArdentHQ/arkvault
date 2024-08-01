import { Contracts } from "@ardenthq/sdk-profiles";
import React from "react";
import { useFormContext } from "react-hook-form";
import { Trans, useTranslation } from "react-i18next";

import { Alert } from "@/app/components/Alert";
import { FormField, FormLabel } from "@/app/components/Form";
import { Header } from "@/app/components/Header";
import { InputPassword } from "@/app/components/Input";
import { assertWallet } from "@/utils/assertions";
import { PasswordValidation } from "@/app/components/PasswordValidation";
import { Icon } from "@/app/components/Icon";
import { useTheme } from "@/app/hooks";

interface EncryptPasswordStepProperties {
	importedWallet?: Contracts.IReadWriteWallet;
}

const SecondInputField = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();
	const { register } = useFormContext();

	assertWallet(wallet);

	if (wallet.actsWithMnemonic()) {
		return (
			<FormField name="secondInput">
				<FormLabel label={t("COMMON.SECOND_MNEMONIC")} />

				<InputPassword
					data-testid="EncryptPassword__second-mnemonic"
					ref={register({
						required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
							field: t("COMMON.SECOND_MNEMONIC"),
						}).toString(),
						validate: async (value) => {
							try {
								await wallet.coin().address().fromMnemonic(value);
								return true;
							} catch {
								return t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_MNEMONIC").toString();
							}
						},
					})}
				/>
			</FormField>
		);
	}

	return (
		<FormField name="secondInput">
			<FormLabel label={t("COMMON.SECOND_SECRET")} />

			<InputPassword
				data-testid="EncryptPassword__second-secret"
				ref={register({
					required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t("COMMON.SECOND_SECRET"),
					}).toString(),
					validate: async (value) => {
						try {
							await wallet.coin().address().fromSecret(value);
						} catch {
							return t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.INVALID_SECRET").toString();
						}
					},
				})}
			/>
		</FormField>
	);
};

export const EncryptPasswordStep = ({ importedWallet }: EncryptPasswordStepProperties) => {
	const { t } = useTranslation();

	const renderSecondInputField = () => {
		if (importedWallet?.hasSyncedWithNetwork() && importedWallet?.isSecondSignature()) {
			return <SecondInputField wallet={importedWallet} />;
		}
	};

	const { isDarkMode } = useTheme();

	const icon = isDarkMode ? "WalletEncryptionDark" : "WalletEncryptionLight";

	return (
		<section data-testid="EncryptPassword">
			<Header
				title={t("WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.TITLE")}
				className="hidden sm:block"
				titleIcon={
					<Icon
						className="text-theme-success-100 dark:text-theme-success-900"
						dimensions={[24, 24]}
						name={icon}
						data-testid={`icon-${icon}`}
					/>
				}
			/>

			<Alert className="mt-4" variant="warning">
				<Trans i18nKey="WALLETS.PAGE_IMPORT_WALLET.ENCRYPT_PASSWORD_STEP.WARNING" />
			</Alert>

			<div className="space-y-4 pt-4">
				{renderSecondInputField()}

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
