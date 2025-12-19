import { Networks } from "@/app/lib/mainsail";
import { DataRepository } from "./data.repository";
import { TokenDTO } from "./token.dto";
import { WalletToken } from "./wallet-token";
import { WalletTokenDTO } from "./wallet-token.dto";
import { Contracts } from ".";

export class WalletTokenRepository {
	readonly #data: DataRepository;
	readonly #profile: Contracts.IProfile;
	readonly #network: Networks.Network;

	public constructor(network: Networks.Network, profile: Contracts.IProfile) {
		this.#data = new DataRepository();
		this.#profile = profile
		this.#network = network
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
		return this.values().find((item: WalletToken) => item.token().address() === tokenAddress);
	}

	public push(token: WalletToken): void {
		this.#data.set(token.address(), token);
	}

	create(data: { walletToken: WalletTokenDTO; token: TokenDTO }) {
		const token = new WalletToken({ ...data, profile: this.#profile, network: this.#network });

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
