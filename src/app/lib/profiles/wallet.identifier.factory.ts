import { Services } from "@ardenthq/sdk";

import { IReadWriteWallet } from "./wallet.contract.js";

export class WalletIdentifierFactory {
	public static async make(wallet: IReadWriteWallet): Promise<Services.WalletIdentifier> {
		if (wallet.actsWithAddress()) {
			return this.#address(wallet);
		}

		if (wallet.actsWithAddressWithDerivationPath()) {
			return this.#address(wallet);
		}

		if (wallet.actsWithMnemonic()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithPublicKey()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithMnemonicWithEncryption()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithPrivateKey()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithWifWithEncryption()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithSecret()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithSecretWithEncryption()) {
			return this.#addressOrPublicKey(wallet);
		}

		if (wallet.actsWithWif()) {
			return this.#addressOrPublicKey(wallet);
		}

		throw new Error(`Unsupported import method ${wallet.importMethod()}`);
	}

	static #address(wallet: IReadWriteWallet): Services.WalletIdentifier {
		return {
			method: wallet.derivationMethod(),
			type: "address",
			value: wallet.address(),
		};
	}

	static #extendedPublicKey(wallet: IReadWriteWallet): Services.WalletIdentifier {
		return {
			method: wallet.derivationMethod(),
			type: "extendedPublicKey",
			value: wallet.publicKey()!,
		};
	}

	static #addressOrPublicKey(wallet: IReadWriteWallet): Services.WalletIdentifier {
		if (wallet.network().usesExtendedPublicKey()) {
			return this.#extendedPublicKey(wallet);
		}

		return this.#address(wallet);
	}
}
