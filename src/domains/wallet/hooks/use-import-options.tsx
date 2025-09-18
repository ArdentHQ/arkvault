import React, { ReactElement } from "react";
import { Networks } from "@/app/lib/mainsail";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Icon } from "@/app/components/Icon";
import { Contracts } from "@/app/lib/profiles";
import { ProfileSetting } from "@/app/lib/profiles/profile.enum.contract";

export enum OptionsValue {
	ADDRESS = "address",
	LEDGER = "ledger",
	BIP39 = "bip39",
	BIP44 = "bip44",
	BIP49 = "bip49",
	BIP84 = "bip84",
	PUBLIC_KEY = "publicKey",
	SECRET = "secret",
}

export interface ImportOption {
	label: string;
	icon?: ReactElement;
	header?: string;
	description?: string;
	value: string;
	canBeEncrypted?: boolean;
}

interface ImportOptions {
	defaultOption: ImportOption;
	options: ImportOption[];
	advancedOptions: ImportOption[];
}

export const useImportOptions = (
	methods: Networks.NetworkManifestImportMethods,
	profile: Contracts.IProfile,
): ImportOptions => {
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
		];

		let defaultOption: ImportOption | undefined;

		const options: ImportOption[] = [];

		if (import.meta.env.VITE_LEDGER_DISABLED !== "true") {
			options.push({
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.LEDGER_DESCRIPTION"),
				header: t("COMMON.LEDGER"),
				icon: <Icon name="LedgerImport" size="lg" />,
				label: t("COMMON.LEDGER"),
				value: OptionsValue.LEDGER,
			});
		}

		const advancedOptions: ImportOption[] = [];

		if (profile.settings().get(ProfileSetting.UseHDWallets)) {
			advancedOptions.push({
				canBeEncrypted: true,
				description: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.HD_WALLET_DESCRIPTION"),
				header: t("WALLETS.PAGE_IMPORT_WALLET.METHOD_STEP.HD_WALLET_TITLE"),
				icon: <Icon name="HDWalletImportMethod" size="lg" />,
				label: t("COMMON.HD_WALLET"),
				value: OptionsValue.BIP44,
			});
		}

		for (const option of allOptions) {
			const methodName = Object.keys(methods).find((methodName) => methodName === option.value);

			if (!methodName) {
				continue;
			}

			const method = methods[methodName] as Networks.ImportMethod;

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

		return { advancedOptions, defaultOption, options };
	}, [t, methods]);
};
