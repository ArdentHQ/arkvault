import { WalletTokenData } from "./token.contracts";

export class WalletTokenDTO {
	#data: WalletTokenData;

	constructor(data: WalletTokenData) {
		this.#data = data;
	}

	address(): string {
		return this.#data.address;
	}

	balance(): number {
		return this.#data.balance;
	}

	tokenAddress(): string {
		return this.#data.tokenAddress;
	}

	toJSON(): WalletTokenData {
		return this.#data;
	}
}

