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

	displaySymbol(): string {
		const symbol = this.symbol();
		const allowedCharCount = 5;

		if (symbol.length <= allowedCharCount) {
			return symbol;
		}

		return this.#data.symbol.slice(0, allowedCharCount) + "…";
	}

	totalSupply(): string {
		return this.#data.totalSupply;
	}

	toJSON(): TokenData {
		return this.#data;
	}
}
