import { Contracts } from "@/app/lib/profiles";
import React, { JSX } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { FormField, FormLabel } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { WalletImportMethod } from "@/app/lib/profiles/wallet.enum";
import { useValidation } from "@/app/hooks";

const Mnemonic = ({ wallet }: { wallet: Contracts.IReadWriteWallet }): JSX.Element => {
	const { t } = useTranslation();

	const { register } = useFormContext();
	const { authentication } = useValidation();

	return (
		<FormField name="mnemonicValue">
			<FormLabel label={t(`COMMON.MNEMONIC_TYPE.BIP44`)} />
			<InputPassword ref={register(authentication.mnemonic(wallet))} />
		</FormField>
	);
};

const EncryptedPassword = ({ wallet }: { wallet: Contracts.IReadWriteWallet }) => {
	const { t } = useTranslation();

	const { register } = useFormContext();
	const { authentication } = useValidation();

	return (
		<FormField name="encryptedPassword">
			<FormLabel label={t(`COMMON.ENCRYPTED_PASSWORD`)} />
			<InputPassword ref={register(authentication.encryptionPassword(wallet))} />
		</FormField>
	);
};

export const EnterImportValueStep = ({ profile }: { profile: Contracts.IProfile }): JSX.Element => {
	const { getValues } = useFormContext();

	const selectedAccount = getValues("selectedAccount") as string;

	const accountWallet = profile
		.wallets()
		.values()
		.find((wallet) => wallet.accountName() === selectedAccount) as Contracts.IReadWriteWallet;

	const isMnemonicInputMethod = accountWallet.importMethod() === WalletImportMethod.BIP44.MNEMONIC;

	return (
		<section data-testid="EnterImportValueStep" className="space-y-2 sm:space-y-1">
			<div>
				{isMnemonicInputMethod ? (
					<Mnemonic wallet={accountWallet} />
				) : (
					<EncryptedPassword wallet={accountWallet} />
				)}
			</div>
		</section>
	);
};
