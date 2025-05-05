import { BigNumber, NumberLike } from "@/app/lib/helpers";

interface BigNumberOptions {
	decimals?: number;
}

export class BigNumberService {
	readonly #decimals: number | undefined;

	constructor(options?: BigNumberOptions) {
		this.#decimals = options?.decimals;
	}

	public make(value: NumberLike): BigNumber {
		return BigNumber.make(value, this.#decimals);
	}
}
