import { Services, Signatories } from "@ardenthq/sdk";

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
		wif,
		privateKey,
	}: SignatoryInput): Promise<Signatories.Signatory> {
		if (mnemonic && secondMnemonic) {
			return this.#wallet.signatory().confirmationMnemonic(mnemonic, secondMnemonic);
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

		if (this.#wallet.isMultiSignature()) {
			return this.#wallet
				.signatory()
				.multiSignature(this.#wallet.multiSignature().all() as Services.MultiSignatureAsset);
		}

		if (this.#wallet.isLedger()) {
			const derivationPath = this.#wallet.data().get(WalletData.DerivationPath);

			if (typeof derivationPath !== "string") {
				throw new TypeError("[derivationPath] must be string.");
			}

			return this.#wallet.signatory().ledger(derivationPath);
		}

		if (wif) {
			return this.#wallet.signatory().wif(wif);
		}

		if (privateKey) {
			return this.#wallet.signatory().privateKey(privateKey);
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
