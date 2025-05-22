import { IdentityOptions } from "./services";

export abstract class AbstractSignatory {
	readonly #signingKey: string;
	readonly #address: string;
	readonly #publicKey: string;
	readonly #options?: IdentityOptions;

	public constructor({
		signingKey,
		address,
		publicKey,
		options,
	}: {
		signingKey: string;
		address: string;
		publicKey: string;
		options?: IdentityOptions;
	}) {
		this.#signingKey = signingKey.normalize("NFD");
		this.#address = address;
		this.#publicKey = publicKey;
		this.#options = options;
	}

	public signingKey(): string {
		return this.#signingKey;
	}

	public address(): string {
		return this.#address;
	}

	public publicKey(): string {
		return this.#publicKey;
	}

	public options(): IdentityOptions | undefined {
		return this.#options;
	}
}
