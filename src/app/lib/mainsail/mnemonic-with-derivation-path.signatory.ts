export class MnemonicWithDerivationPathSignatory {
	readonly #signingKey: string;
	readonly #path: string;

	public constructor({ signingKey, path }: { signingKey: string; path: string }) {
		this.#signingKey = signingKey;
		this.#path = path;
	}

	public signingKey(): string {
		return this.#signingKey;
	}

	public path(): string {
		return this.#path;
	}
}
