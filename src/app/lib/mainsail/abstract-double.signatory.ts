export abstract class AbstractDoubleSignatory {
	readonly #signingKey: string;
	readonly #confirmKey: string;
	readonly #address: string;
	readonly #publicKey: string;

	public constructor({
		signingKey,
		confirmKey,
		address,
		publicKey,
	}: {
		signingKey: string;
		confirmKey: string;
		address: string;
		publicKey: string;
	}) {
		this.#signingKey = signingKey.normalize("NFD");
		this.#confirmKey = confirmKey.normalize("NFD");
		this.#address = address;
		this.#publicKey = publicKey;
	}

	public signingKey(): string {
		return this.#signingKey;
	}

	public confirmKey(): string {
		return this.#confirmKey;
	}

	public address(): string {
		return this.#address;
	}

	public publicKey(): string {
		return this.#publicKey;
	}
}
