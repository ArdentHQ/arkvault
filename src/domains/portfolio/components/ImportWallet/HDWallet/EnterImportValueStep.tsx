import { Contracts } from "@/app/lib/profiles";
import React, { JSX } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { WalletImportMethod } from "@/app/lib/profiles/wallet.enum";

const Mnemonic = (): JSX.Element => {
	const { t } = useTranslation();

	const { register } = useFormContext();

	return (
		<FormField name="value">
			<FormLabel label={t(`COMMON.MNEMONIC_TYPE.BIP44`)} />
			<InputPassword
				ref={register({
					required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t(`COMMON.MNEMONIC_TYPE.BIP44`),
					}).toString(),
					validate: (value) => {return false}
				})}
			/>
		</FormField>
	)
}

const EncryptedPassword= () => {
	const { t } = useTranslation();

	const { register } = useFormContext();

	return (
		<FormField name="value">
			<FormLabel label={t(`COMMON.ENCRYPTED_PASSWORD`)} />
			<InputPassword
				ref={register({
					required: t("COMMON.VALIDATION.FIELD_REQUIRED", {
						field: t(`COMMON.ENCRYPTED_PASSWORD`),
					}).toString(),
					validate: (value) => {return false}
				})}
			/>
		</FormField>
	)
}

export const EnterImportValueStep = ({ profile }: { profile: Contracts.IProfile }): JSX.Element => {
	const { getValues } = useFormContext();

	const selectedAccount = getValues("selectedAccount") as string;

	const accountWallet = profile.wallets().values().find((wallet) => wallet.accountName() === selectedAccount) as Contracts.IReadWriteWallet;

	const isMnemonicInputMethod= accountWallet.importMethod() === WalletImportMethod.BIP44.MNEMONIC;

	return (
		<section data-testid="EnterImportValueStep" className="space-y-2 sm:space-y-1">
			<div>
				{isMnemonicInputMethod ? <Mnemonic /> : <EncryptedPassword />}
			</div>
		</section>
	);
};
