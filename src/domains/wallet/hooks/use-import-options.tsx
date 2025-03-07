import React from "react";
import { Networks } from "@ardenthq/sdk";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { ImportMethod } from "@ardenthq/sdk/distribution/esm/network.models";

export enum OptionsValue {
	ADDRESS = "address",
	BIP39 = "bip39",
	BIP44 = "bip44",
	BIP49 = "bip49",
	BIP84 = "bip84",
	ENCRYPTED_WIF = "encryptedWif",
	PRIVATE_KEY = "privateKey",
	PUBLIC_KEY = "publicKey",
	SECRET = "secret",
	WIF = "wif",
}

export interface ImportOption {
	label: string;
	icon?: JSX.Element;
	header?: string;
	description?: string;
	value: string;
	canBeEncrypted?: boolean;
}

interface ImportOptions {
	defaultOption: ImportOption;
	options: ImportOption[];
}

const convertMethodName = (methodName: string) => {
	if (methodName === "bip38") {
		return OptionsValue.ENCRYPTED_WIF;
	}

	return methodName;
};

export const useImportOptions = (methods: Networks.NetworkManifestImportMethods): ImportOptions => {
	const { t } = useTranslation();

	return useMemo(() => {
		const allOptions: ImportOption[] = [
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TITLE"),
				icon: <Icon name="MnemonicImportMethod" size="lg" />,
				label: t("COMMON.MNEMONIC_TYPE.BIP39"),
				value: OptionsValue.BIP39,
			},
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TITLE"),
				icon: <Icon name="MnemonicImportMethod" size="lg" />,
				label: t("COMMON.MNEMONIC_TYPE.BIP44"),
				value: OptionsValue.BIP44,
			},
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TITLE"),
				icon: <Icon name="MnemonicImportMethod" size="lg" />,
				label: t("COMMON.MNEMONIC_TYPE.BIP49"),
				value: OptionsValue.BIP49,
			},
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.MNEMONIC_TITLE"),
				icon: <Icon name="MnemonicImportMethod" size="lg" />,
				label: t("COMMON.MNEMONIC_TYPE.BIP84"),
				value: OptionsValue.BIP84,
			},
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.SECRET_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.SECRET_TITLE"),
				icon: <Icon name="SecretImportMethod" size="lg" />,
				label: t("COMMON.SECRET"),
				value: OptionsValue.SECRET,
			},
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.ADDRESS_DESCRIPTION"),
				header: t("COMMON.ADDRESS"),
				icon: <Icon name="AddressImportMethod" size="lg" />,
				label: t("COMMON.ADDRESS"),
				value: OptionsValue.ADDRESS,
			},
			{
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.PUBLIC_KEY_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.PUBLIC_KEY_TITLE"),
				icon: <Icon name="PublicKeyImportMethod" size="lg" />,
				label: t("COMMON.PUBLIC_KEY"),
				value: OptionsValue.PUBLIC_KEY,
			},
			{
				label: t("COMMON.PRIVATE_KEY"),
				value: OptionsValue.PRIVATE_KEY,
			},
			{
				label: t("COMMON.WIF"),
				value: OptionsValue.WIF,
			},
			{
				label: t("COMMON.ENCRYPTED_WIF"),
				value: OptionsValue.ENCRYPTED_WIF,
			},
		];

		let defaultOption: ImportOption | undefined;

		const options: ImportOption[] = [];

		for (const option of allOptions) {
			const methodName= Object.keys(methods).find((methodName) => convertMethodName(methodName) === option.value);

			if (!methodName) {
				continue;
			}

			const method = methods[methodName] as ImportMethod;

			if (method.default) {
				defaultOption = option;
			}

			options.push({
				canBeEncrypted: !!method.canBeEncrypted,
				description: option.description,
				header: option.header,
				icon: option.icon,
				label: option.label,
				value: option.value,
			});
		}

		if (!defaultOption) {
			defaultOption = options[0];
		}

		return { defaultOption, options };
	}, [t, methods]);
};
