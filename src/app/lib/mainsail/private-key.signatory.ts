import { IdentityOptions } from "./services";

export class PrivateKeySignatory {
	readonly #signingKey: string;
	readonly #address: string;
	readonly #options?: IdentityOptions;

	public constructor({
		signingKey,
		address,
		options,
	}: {
		signingKey: string;
		address: string;
		options?: IdentityOptions;
	}) {
		this.#signingKey = signingKey;
		this.#address = address;
		this.#options = options;
	}

	public signingKey(): string {
		return this.#signingKey;
	}

	public address(): string {
		return this.#address;
	}

	public privateKey(): string {
		return this.#signingKey;
	}

	public options(): IdentityOptions | undefined {
		return this.#options;
	}
}
