import { ArkClient } from "@arkecosystem/typescript-client";
import { Coins, IoC, Networks } from "@/app/lib/sdk";

import { BindingType } from "./coin.contract.js";
import { Managers } from "./crypto/index.js";

export class ServiceProvider extends IoC.AbstractServiceProvider {
	public override async make(container: IoC.Container): Promise<void> {
		console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
		const hostSelector = container.get<Networks.NetworkHostSelector>(IoC.BindingType.NetworkHostSelector);
		const { host } = hostSelector(container.get(IoC.BindingType.ConfigRepository));
		const client = new ArkClient(host);

		await this.#retrieveNetworkConfiguration({
			client,
			container,
			host,
		});

		await this.compose(container);
	}

	async #retrieveNetworkConfiguration({
		client,
		container,
		host,
	}: {
		client: ArkClient;
		container: IoC.Container;
		host: string;
	}): Promise<void> {
		const [crypto, status] = await Promise.all([client.node().crypto(), client.node().syncing()]);

		const dataCrypto = crypto.data;
		const { blockNumber } = status.data;

		if (dataCrypto.network.client.token !== this.configRepository.get(Coins.ConfigKey.CurrencyTicker)) {
			throw new Error(`Failed to connect to ${host} because it is on another network.`);
		}

		Managers.configManager.setConfig(dataCrypto);
		Managers.configManager.setHeight(blockNumber);

		if (container.missing(BindingType.Crypto)) {
			container.constant(BindingType.Crypto, dataCrypto);
		}

		if (container.missing(BindingType.Height)) {
			container.constant(BindingType.Height, blockNumber);
		}
	}
}
