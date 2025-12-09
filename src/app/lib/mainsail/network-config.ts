import { AbstractNetwork } from "@arkecosystem/typescript-crypto";
import { ConfigKey, ConfigRepository } from "@/app/lib/mainsail/config.repository";

export class NetworkConfig extends AbstractNetwork {
	readonly #config: ConfigRepository;

	public constructor(config: ConfigRepository) {
		super();
		this.#config = config;
	}

	public chainId(): number {
		return this.#config.get("crypto.network.chainId");
	}

	public epoch(): string {
		return this.#config.get(ConfigKey.Epoch);
	}

	public wif(): string {
		return this.#config.get(ConfigKey.Wif);
	}
}
