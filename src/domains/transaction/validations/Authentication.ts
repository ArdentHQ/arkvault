import { BIP39 } from "@ardenthq/arkvault-crypto";
import { Contracts } from "@/app/lib/profiles";

import { debounceAsync } from "@/utils/debounce";
import { AddressService } from "@/app/lib/mainsail/address.service";
import { MnemonicWithDerivationPathService } from "@/app/lib/mainsail/mnemonic-with-derivation-path.service";
import { WalletData } from "@/app/lib/profiles/wallet.enum";

const requiredFieldMessage = "COMMON.VALIDATION.FIELD_REQUIRED";

// @TODO: extract this into the SDK/Profiles
const addressFromEncryptedPassword = async (wallet: Contracts.IReadWriteWallet, password: string) => {
	try {
		const wif = await wallet.signingKey().get(password);

		if (BIP39.validate(wif)) {
			const { address } = new AddressService().fromMnemonic(wif);

			return address;
		}

		const { address } = new AddressService().fromSecret(wif);

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
				matchSenderAddress: (mnemonic: string) => {
					try {
						let address: string;

						if (wallet.isHDWallet()) {
							const account = MnemonicWithDerivationPathService.getAccount(
								mnemonic,
								wallet.data().get(WalletData.DerivationPath) as string,
							);
							address = account.address;
						} else {
							address = new AddressService().fromMnemonic(mnemonic).address;
						}

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
			validate: (privateKey: string) => {
				const { address } = new AddressService().fromPrivateKey(privateKey);

				if (address === wallet.address()) {
					return true;
				}

				return t("COMMON.INPUT_PASSPHRASE.VALIDATION.PRIVATE_KEY_NOT_MATCH_WALLET");
			},
		}),
		secondMnemonic: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.SECOND_MNEMONIC"),
			}),
			validate: {
				matchSenderPublicKey: (mnemonic: string) => {
					try {
						const { publicKey } = wallet.publicKeyService().fromMnemonic(mnemonic);

						if (publicKey === wallet.secondPublicKey()) {
							return true;
						}

						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET");
					} catch {
						return t("COMMON.INPUT_PASSPHRASE.VALIDATION.MNEMONIC_NOT_MATCH_WALLET");
					}
				},
			},
		}),
		secondSecret: (wallet: Contracts.IReadWriteWallet) => ({
			required: t(requiredFieldMessage, {
				field: t("COMMON.SECOND_SECRET"),
			}),
			validate: {
				matchSenderPublicKey: (secret: string) => {
					try {
						const { publicKey } = wallet.publicKeyService().fromSecret(secret);

						if (publicKey === wallet.secondPublicKey()) {
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
			validate: (secret: string) => {
				try {
					const { address } = new AddressService().fromSecret(secret);

					if (address === wallet.address()) {
						return true;
					}

					return t("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
				} catch {
					return t("COMMON.INPUT_PASSPHRASE.VALIDATION.SECRET_NOT_MATCH_WALLET");
				}
			},
		}),
	};
};
