import { DataRepository } from "./data.repository";
import { IWalletTokenData } from "./token.contracts";
import { WalletToken } from "./wallet-token.dto";

export class WalletTokenRepository {
	readonly #data: DataRepository;

	public constructor() {
		this.#data = new DataRepository();
	}

	public fill(tokens: object): void {
		for (const [id, token] of Object.entries(tokens)) {
			this.#data.set(id, new WalletToken(token));
		}
	}

	public all(): Record<string, WalletToken> {
		return this.#data.all() as Record<string, WalletToken>;
	}

	public first(): WalletToken {
		return this.#data.first();
	}

	public last(): WalletToken {
		return this.#data.last();
	}

	public keys(): string[] {
		return this.#data.keys();
	}

	public values(): WalletToken[] {
		return this.#data.values();
	}

	public findByTokenAddress(tokenAddress: string): WalletToken | undefined {
		return this.values().find((token: WalletToken) => token.tokenAddress() === tokenAddress);
	}

	public push(token: WalletToken): void {
		this.#data.set(token.address(), token);
	}

	public create(data: IWalletTokenData): WalletToken {
		const token = new WalletToken(data);

		this.push(token);

		return token;
	}

	public has(id: string): boolean {
		return this.#data.has(id);
	}

	public forget(id: string): void {
		if (this.#data.missing(id)) {
			throw new Error(`No wallet token found for [${id}].`);
		}

		this.#data.forget(id);
	}

	public flush(): void {
		this.#data.flush();
	}

	public count(): number {
		return this.#data.count();
	}
}
