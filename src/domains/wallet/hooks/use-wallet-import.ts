import { Networks } from "@payvo/sdk";
import { Contracts } from "@payvo/sdk-profiles";
import { useTranslation } from "react-i18next";

import { OptionsValue } from "./use-import-options";

type PrivateKey = string;
type Mnemonic = string;
type WIF = string;
type Address = string;

export type WalletGenerationInput = PrivateKey | Mnemonic | WIF | Address;

type ImportOptionsType = {
	[key in OptionsValue]: () => Promise<Contracts.IReadWriteWallet>;
} & {
	default: () => undefined;
};

export const useWalletImport = ({ profile }: { profile: Contracts.IProfile }) => {
	const { t } = useTranslation();

	const importWalletByType = async ({
		network,
		type,
		value,
		encryptedWif,
	}: {
		network: Networks.Network;
		type: string;
		value: WalletGenerationInput;
		encryptedWif: string;
	}): Promise<Contracts.IReadWriteWallet | undefined> => {
		const defaultOptions = {
			coin: network.coin(),
			network: network.id(),
		};

		const importOptions: ImportOptionsType = {
			[OptionsValue.BIP39]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP39({
						...defaultOptions,
						mnemonic: value,
					}),
				),
			[OptionsValue.BIP44]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP44({
						...defaultOptions,
						levels: { account: 0 },
						mnemonic: value,
					}),
				),
			[OptionsValue.BIP49]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP49({
						...defaultOptions,
						levels: { account: 0 },
						mnemonic: value,
					}),
				),
			[OptionsValue.BIP84]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromMnemonicWithBIP84({
						...defaultOptions,
						levels: { account: 0 },
						mnemonic: value,
					}),
				),
			[OptionsValue.ADDRESS]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromAddress({
						...defaultOptions,
						address: value,
					}),
				),
			[OptionsValue.PUBLIC_KEY]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromPublicKey({
						...defaultOptions,
						publicKey: value,
					}),
				),
			[OptionsValue.PRIVATE_KEY]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromPrivateKey({
						...defaultOptions,
						privateKey: value,
					}),
				),
			[OptionsValue.WIF]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromWIF({
						...defaultOptions,
						wif: value,
					}),
				),
			[OptionsValue.ENCRYPTED_WIF]: async () =>
				new Promise((resolve, reject) => {
					// `setTimeout` being used here to avoid blocking the thread
					// as the decryption is a expensive calculation
					setTimeout(() => {
						profile
							.walletFactory()
							.fromWIF({
								...defaultOptions,
								password: value,
								wif: encryptedWif,
							})
							.then((wallet) => {
								profile.wallets().push(wallet);
								return resolve(wallet);
							})
							.catch((error) => {
								/* istanbul ignore next */
								if (error.code === "ERR_ASSERTION") {
									return reject(
										new Error(t("WALLETS.PAGE_IMPORT_WALLET.VALIDATION.DECRYPT_WIF_ASSERTION")),
									);
								}

								reject(error);
							});
					}, 0);
				}),
			[OptionsValue.SECRET]: async () =>
				profile.wallets().push(
					await profile.walletFactory().fromSecret({
						...defaultOptions,
						secret: value,
					}),
				),
			default: () => void 0,
		};

		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		return (importOptions[type as keyof typeof importOptions] || importOptions.default)();
	};

	return { importWalletByType };
};
