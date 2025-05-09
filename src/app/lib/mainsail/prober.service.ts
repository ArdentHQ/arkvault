import { ArkClient } from "@arkecosystem/typescript-client";
import { ConfigKey, ConfigRepository } from "@/app/lib/sdk/coins";

export class ProberService {
	readonly #config: ConfigRepository;

	public constructor({ config }: { config: ConfigRepository }) {
		this.#config = config;
	}

	public async evaluate(host: string): Promise<boolean> {
		try {
			const client = new ArkClient(host);
			const { data } = await client.node().crypto();
			return data.network.client.token === this.#config.get(ConfigKey.CurrencyTicker);
		} catch {
			return false;
		}
	}
}
