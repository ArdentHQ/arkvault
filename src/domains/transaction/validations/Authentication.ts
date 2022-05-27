import { Coins } from "@payvo/sdk";
import { BIP39 } from "@payvo/sdk-cryptography";
import { Contracts } from "@payvo/sdk-profiles";

import { debounceAsync } from "@/utils/debounce";

const requiredFieldMessage = "COMMON.VALIDATION.FIELD_REQUIRED";

// @TODO: extract this into the SDK/Profiles
const addressFromEncryptedPassword = async (wallet: Contracts.IReadWriteWallet, password: string) => {
	try {
		const wif = await wallet.signingKey().get(password);

		if (BIP39.validate(wif)) {
			const { address } = await wallet.coin().address().fromMnemonic(wif);

			return address;
		}

		const { address } = await wallet.coin().address().fromSecret(wif);

		return address;
	} catch {
		return;
	}
};

export const authentication = (t: any) => {
	const addressFromPassword = debounceAsync(addressFromEncryptedPassword, 700);

	return {
		encryptionPassword: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("TRANSACTION.ENCRYPTION_PASSWORD"),
			}),
			validate: async (password: string) => {
				const address = await addressFromPassword(wallet, password);

				if (address === wallet.address()) {
					return true;
				}

				return t("COMMON.INPUT_PASSPHRASE.VALIDATION.PASSWORD_NOT_MATCH_WALLET");
			},
		}),
		mnemonic: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.MNEMONIC"),
			}),
			validate: {
				matchSenderAddress: async (mnemonic: string) => {
					try {
						const { address } = await wallet.coin().address().fromMnemonic(mnemonic);

						if (address === wallet.address()) {
							return true;
						}

						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET");
					} catch {
						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET");
					}
				},
			},
		}),
		privateKey: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.PRIVATE_KEY"),
			}),
			validate: async (privateKey: string) => {
				const { address } = await wallet.coin().address().fromPrivateKey(privateKey);

				if (address === wallet.address()) {
					return true;
				}

				return t("COMMON.INPUT_PASSPHRASE.VALIDATION.PRIVATE_KEY_NOT_MATCH_WALLET");
			},
		}),
		secondMnemonic: (coin: Coins.Coin, secondPublicKey: string) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.SECOND_MNEMONIC"),
			}),
			validate: {
				matchSenderPublicKey: async (mnemonic: string) => {
					try {
						const { publicKey } = await coin.publicKey().fromMnemonic(mnemonic);

						if (publicKey === secondPublicKey) {
							return true;
						}

						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET");
					} catch {
						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET");
					}
				},
			},
		}),
		secondSecret: (coin: Coins.Coin, secondPublicKey: string) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.SECOND_SECRET"),
			}),
			validate: {
				matchSenderPublicKey: async (secret: string) => {
					try {
						const { publicKey } = await coin.publicKey().fromSecret(secret);

						if (publicKey === secondPublicKey) {
							return true;
						}

						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
					} catch {
						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
					}
				},
			},
		}),
		secret: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.SECRET"),
			}),
			validate: async (secret: string) => {
				try {
					const { address } = await wallet.coin().address().fromSecret(secret);

					if (address === wallet.address()) {
						return true;
					}

					return t("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
				} catch {
					return t("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
				}
			},
		}),
		wif: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.WIF"),
			}),
			validate: {
				matchSenderAddress: async (wif: string) => {
					const { address } = await wallet.coin().address().fromWIF(wif);

					if (address === wallet.address()) {
						return true;
					}

					return t("COMMON.INPUT_PASSPHRASE.VALIDATION.WIF_NOT_MATCH_WALLET");
				},
			},
		}),
	};
};
