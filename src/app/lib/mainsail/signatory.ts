/* istanbul ignore file */

import { AbstractSignatory } from "./abstract.signatory";
import { AbstractDoubleSignatory } from "./abstract-double.signatory";
import { ConfirmationMnemonicSignatory } from "./confirmation-mnemonic.signatory";
import { ConfirmationSecretSignatory } from "./confirmation-secret.signatory";
import { ForbiddenMethodCallException } from "./exceptions";
import { LedgerSignatory } from "./ledger.signatory";
import { MnemonicSignatory } from "./mnemonic.signatory";
import { SecretSignatory } from "./secret.signatory";
import { IdentityOptions } from "./services";
import { MnemonicWithDerivationPathSignatory } from "@/app/lib/mainsail/mnemonic-with-derivation-path.signatory";

type SignatoryType =
	| ConfirmationMnemonicSignatory
	| ConfirmationSecretSignatory
	| LedgerSignatory
	| MnemonicSignatory
	| SecretSignatory
	| MnemonicWithDerivationPathSignatory;

export class Signatory {
	readonly #signatory: SignatoryType;

	public constructor(signatory: SignatoryType) {
		this.#signatory = signatory;
	}

	public signingKey(): string {
		return this.#signatory.signingKey();
	}

	public confirmKey(): string {
		// @TODO: deduplicate this
		if (this.#signatory instanceof ConfirmationMnemonicSignatory) {
			return this.#signatory.confirmKey();
		}

		if (this.#signatory instanceof ConfirmationSecretSignatory) {
			return this.#signatory.confirmKey();
		}

		throw new ForbiddenMethodCallException(this.constructor.name, this.confirmKey.name);
	}

	public address(): string {
		// @TODO: deduplicate this
		if (this.#signatory instanceof AbstractSignatory) {
			return this.#signatory.address();
		}

		if (this.#signatory instanceof AbstractDoubleSignatory) {
			return this.#signatory.address();
		}

		throw new ForbiddenMethodCallException(this.constructor.name, this.address.name);
	}

	public publicKey(): string {
		// @TODO: deduplicate this
		if (this.#signatory instanceof AbstractSignatory) {
			return this.#signatory.publicKey();
		}

		if (this.#signatory instanceof AbstractDoubleSignatory) {
			return this.#signatory.publicKey();
		}

		throw new ForbiddenMethodCallException(this.constructor.name, this.publicKey.name);
	}

	public path(): string {
		if (this.#signatory instanceof LedgerSignatory) {
			return this.#signatory.signingKey();
		}

		if (this.#signatory instanceof MnemonicWithDerivationPathSignatory) {
			return this.#signatory.path();
		}

		throw new ForbiddenMethodCallException(this.constructor.name, this.path.name);
	}

	public options(): IdentityOptions | undefined {
		if (this.#signatory instanceof AbstractSignatory) {
			return this.#signatory.options();
		}

		if (this.#signatory instanceof LedgerSignatory) {
			return this.#signatory.options();
		}

		throw new ForbiddenMethodCallException(this.constructor.name, "");
	}

	public actsWithMnemonic(): boolean {
		return this.#signatory instanceof MnemonicSignatory;
	}

	public actsWithMnemonicWithDerivationPath(): boolean {
		return this.#signatory instanceof MnemonicWithDerivationPathSignatory;
	}

	public actsWithConfirmationMnemonic(): boolean {
		return this.#signatory instanceof ConfirmationMnemonicSignatory;
	}

	public actsWithLedger(): boolean {
		return this.#signatory instanceof LedgerSignatory;
	}

	public actsWithSecret(): boolean {
		return this.#signatory instanceof SecretSignatory;
	}

	public actsWithConfirmationSecret(): boolean {
		return this.#signatory instanceof ConfirmationSecretSignatory;
	}
}
