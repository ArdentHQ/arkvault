import { BigNumber, NumberLike } from "@/app/lib/helpers";

interface BigNumberOptions {
	currencyDecimals?: number;
}

export class BigNumberService {
	readonly #currencyDecimals: number | undefined;

	public constructor(options?: BigNumberOptions) {
		this.#currencyDecimals = options?.currencyDecimals;
		//this.#configRepository = container.get(BindingType.ConfigRepository);
	}

	public make(value: NumberLike): BigNumber {
		// @TODO: Pull currency decimals from mainsail config.
		//return BigNumber.make(value, this.#configRepository.get<number>(ConfigKey.CurrencyDecimals));
		return BigNumber.make(value, this.#currencyDecimals);
	}
}
