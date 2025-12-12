import { IWalletTokenData } from "./token.contracts";

export class WalletToken {
	#data: IWalletTokenData;

	constructor(data: IWalletTokenData) {
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
}
