import { Networks } from "@payvo/sdk";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
			{ label: t("COMMON.MNEMONIC_TYPE.BIP39"), value: OptionsValue.BIP39 },
			{ label: t("COMMON.MNEMONIC_TYPE.BIP44"), value: OptionsValue.BIP44 },
			{ label: t("COMMON.MNEMONIC_TYPE.BIP49"), value: OptionsValue.BIP49 },
			{ label: t("COMMON.MNEMONIC_TYPE.BIP84"), value: OptionsValue.BIP84 },
			{ label: t("COMMON.ADDRESS"), value: OptionsValue.ADDRESS },
			{ label: t("COMMON.PUBLIC_KEY"), value: OptionsValue.PUBLIC_KEY },
			{ label: t("COMMON.PRIVATE_KEY"), value: OptionsValue.PRIVATE_KEY },
			{ label: t("COMMON.SECRET"), value: OptionsValue.SECRET },
			{ label: t("COMMON.WIF"), value: OptionsValue.WIF },
			{ label: t("COMMON.ENCRYPTED_WIF"), value: OptionsValue.ENCRYPTED_WIF },
		];

		let defaultOption: ImportOption | undefined;

		const options: ImportOption[] = [];

		for (const [methodName, method] of Object.entries(methods)) {
			const matchingOption = allOptions.find((option) => option.value === convertMethodName(methodName));

			if (!matchingOption) {
				continue;
			}

			if (method.default) {
				defaultOption = matchingOption;
			}

			options.push({
				canBeEncrypted: !!method.canBeEncrypted,
				label: matchingOption.label,
				value: matchingOption.value,
			});
		}

		if (!defaultOption) {
			defaultOption = options[0];
		}

		return { defaultOption, options };
	}, [t, methods]);
};
