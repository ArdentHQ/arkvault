import { TokenDTO } from "./token.dto";
import { BigNumber } from "@/app/lib/helpers";
import { TransactionTokenData } from "@/app/lib/profiles/token.contracts";

export class TransactionToken {
	#data: TransactionTokenData;

	constructor(data: TransactionTokenData) {
		this.#data = data;
	}

	from(): string {
		return this.#data.from;
	}

	to(): string {
		return this.#data.to;
	}

	value(): BigNumber {
		return BigNumber.make(this.#data.value, this.token().decimals());
	}

	index(): number {
		return this.#data.index;
	}

	token(): TokenDTO {
		const tokenData = this.#data.metadata;

		return new TokenDTO({
			address: tokenData.tokenAddress,
			decimals: tokenData.tokenDecimals,
			deploymentHash: "",
			name: tokenData.tokenName,
			symbol: tokenData.tokenSymbol,
			totalSupply: "",
		});
	}
}
