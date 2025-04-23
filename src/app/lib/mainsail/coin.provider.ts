import { Coins, IoC } from "@ardenthq/sdk";

import { BindingType } from "./coin.contract.js";
import { Managers } from "./crypto/index.js";
import { Request } from "./request.js";

export class ServiceProvider extends IoC.AbstractServiceProvider {
	public override async make(container: IoC.Container): Promise<void> {
		await this.#retrieveNetworkConfiguration(container);

		await this.compose(container);
	}

	async #retrieveNetworkConfiguration(container: IoC.Container): Promise<void> {
		const request = new Request(
			container.get(IoC.BindingType.ConfigRepository),
			container.get(IoC.BindingType.HttpClient),
			container.get(IoC.BindingType.NetworkHostSelector),
		);

		const [crypto, status] = await Promise.all([
			request.get("node/configuration/crypto"),
			request.get("node/syncing"),
		]);

		const dataCrypto = crypto.data;
		const { height } = status.data;

		if (dataCrypto.network.client.token !== this.configRepository.get(Coins.ConfigKey.CurrencyTicker)) {
			throw new Error(`Failed to connect to ${request.latestHost()?.host} because it is on another network.`);
		}

		Managers.configManager.setConfig(dataCrypto);
		Managers.configManager.setHeight(height);

		if (container.missing(BindingType.Crypto)) {
			container.constant(BindingType.Crypto, dataCrypto);
		}

		if (container.missing(BindingType.Height)) {
			container.constant(BindingType.Height, height);
		}
	}
}
