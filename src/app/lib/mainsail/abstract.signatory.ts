import { IdentityOptions } from "./services";

export abstract class AbstractSignatory {
	readonly #signingKey: string;
	readonly #address: string;
	readonly #publicKey: string;
	readonly #privateKey: string;
	readonly #options?: IdentityOptions;

	public constructor({
		signingKey,
		address,
		publicKey,
		privateKey,
		options,
	}: {
		signingKey: string;
		address: string;
		publicKey: string;
		privateKey: string;
		options?: IdentityOptions;
	}) {
		this.#signingKey = signingKey.normalize("NFD");
		this.#address = address;
		this.#publicKey = publicKey;
		this.#privateKey = privateKey;
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

	public privateKey(): string {
		return this.#privateKey;
	}

	public options(): IdentityOptions | undefined {
		return this.#options;
	}
}
