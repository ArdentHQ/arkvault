import { BigNumber, NumberLike } from "@ardenthq/sdk-helpers";

import { ConfigKey, ConfigRepository } from "./config";
import { IContainer } from "./container.contracts";
import { BindingType } from "./service-provider.contract";

export class BigNumberService {
	readonly #configRepository: ConfigRepository;

	public constructor(container: IContainer) {
		this.#configRepository = container.get(BindingType.ConfigRepository);
	}

	public make(value: NumberLike): BigNumber {
		return BigNumber.make(value, this.#configRepository.get<number>(ConfigKey.CurrencyDecimals));
	}
}
