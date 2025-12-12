import { TokenData } from "./token.contracts";

export class TokenDTO {
	#data: TokenData;

	constructor(data: TokenData) {
		this.#data = data;
	}

	address(): string {
		return this.#data.address;
	}

	decimals(): number {
		return this.#data.decimals;
	}

	deploymentHash(): string {
		return this.#data.deploymentHash;
	}

	name(): string {
		return this.#data.name;
	}

	symbol(): string {
		return this.#data.symbol;
	}

	totalSupply(): string {
		return this.#data.totalSupply;
	}

	toJSON(): TokenData {
		return this.#data
	}
}
