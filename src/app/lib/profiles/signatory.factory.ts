/* eslint unicorn/no-abusive-eslint-disable: "off" */
/* eslint-disable */
import { Signatories } from "@/app/lib/mainsail";

import { IReadWriteWallet, WalletData } from "./contracts.js";
import { ISignatoryFactory, SignatoryInput } from "./signatory.factory.contract.js";

export class SignatoryFactory implements ISignatoryFactory {
	readonly #wallet: IReadWriteWallet;

	public constructor(wallet: IReadWriteWallet) {
		this.#wallet = wallet;
	}

	public async make({
		encryptionPassword,
		mnemonic,
		secondMnemonic,
		secret,
		secondSecret,
	}: SignatoryInput): Promise<Signatories.Signatory> {
		if (mnemonic && secondMnemonic) {
			return this.#wallet.signatory().confirmationMnemonic(mnemonic, secondMnemonic);
		}

		if (mnemonic && this.#wallet.actsWithMnemonicWithDerivationPath()) {
			const derivationPath = this.#wallet.data().get(WalletData.DerivationPath);

			if (typeof derivationPath !== "string") {
				throw new TypeError("[derivationPath] must be string.");
			}

			return this.#wallet.signatory().mnemonicWithDerivationPath(mnemonic, derivationPath);
		}

		if (mnemonic) {
			return this.#wallet.signatory().mnemonic(mnemonic);
		}

		if (encryptionPassword) {
			if (this.#wallet.isSecondSignature()) {
				if (this.#wallet.actsWithSecretWithEncryption()) {
					return this.#wallet
						.signatory()
						.confirmationSecret(
							await this.#wallet.signingKey().get(encryptionPassword),
							await this.#wallet.confirmKey().get(encryptionPassword),
						);
				}

				return this.#wallet
					.signatory()
					.confirmationMnemonic(
						await this.#wallet.signingKey().get(encryptionPassword),
						await this.#wallet.confirmKey().get(encryptionPassword),
					);
			}

			if (this.#wallet.actsWithSecretWithEncryption()) {
				return this.#wallet.signatory().secret(await this.#wallet.signingKey().get(encryptionPassword));
			}

			return this.#wallet.signatory().mnemonic(await this.#wallet.signingKey().get(encryptionPassword));
		}

		if (this.#wallet.isLedger()) {
			const derivationPath = this.#wallet.data().get(WalletData.DerivationPath);

			if (typeof derivationPath !== "string") {
				throw new TypeError("[derivationPath] must be string.");
			}

			return this.#wallet.signatory().ledger(derivationPath);
		}

		if (secret && secondSecret) {
			return this.#wallet.signatory().confirmationSecret(secret, secondSecret);
		}

		if (secret) {
			return this.#wallet.signatory().secret(secret);
		}

		throw new Error("No signing key provided.");
	}
}
