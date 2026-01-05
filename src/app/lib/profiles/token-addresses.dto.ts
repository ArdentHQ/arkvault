import { TokenAddressesData } from "./token.contracts";

export class TokenAddressesDTO {
	readonly #data: TokenAddressesData;

	constructor(data: TokenAddressesData) {
		this.#data = data;
	}

	addresses(): Record<string, string>{
		return this.#data.addresses;
	}

	decimals(): number {
		return this.#data.decimals;
	}

	name(): string {
		return this.#data.name;
	}

	supply(): string {
		return this.#data.supply;
	}

	symbol(): string {
		return this.#data.symbol;
	}

	token(): string {
		return this.#data.token;
	}

	toJSON(): TokenAddressesData {
		return this.#data;
	}
}
