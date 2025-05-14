import { Networks, Services } from "@/app/lib/sdk";

import { HttpClient } from "@/app/services/HttpClient.js";
import { ConfigKey } from "@/app/lib/sdk/config";

type KnownWalletRegistry = Record<string, Services.KnownWallet[]>;

export class KnownWalletService {
	readonly #registry: KnownWalletRegistry = {};

	/** {@inheritDoc IKnownWalletService.sync} */
	public async sync(network: Networks.Network): Promise<void> {
		const client = new HttpClient(0);

		try {
			const url = network.config().get<string>(ConfigKey.KnownWallets);
			const response = await client.get(url);
			const results = response.json();

			if (Array.isArray(results)) {
				this.#registry[network.id()] = results;
			}
		} catch {
			// Do nothing if it fails. It's not critical functionality.
		}
	}

	/** {@inheritDoc IKnownWalletService.network} */
	public name(network: string, address: string): string | undefined {
		return this.#findByAddress(network, address)?.name;
	}

	/** {@inheritDoc IKnownWalletService.network} */
	public is(network: string, address: string): boolean {
		return this.#findByAddress(network, address) !== undefined;
	}

	/** {@inheritDoc IKnownWalletService.network} */
	public isExchange(network: string, address: string): boolean {
		return this.#hasType(network, address, "exchange");
	}

	/** {@inheritDoc IKnownWalletService.network} */
	public isTeam(network: string, address: string): boolean {
		return this.#hasType(network, address, "team");
	}

	#findByAddress(network: string, address: string): Services.KnownWallet | undefined {
		const registry: Services.KnownWallet[] = this.#registry[network];

		if (registry === undefined) {
			return undefined;
		}

		return registry.find((wallet: Services.KnownWallet) => wallet.address === address);
	}

	#hasType(network: string, address: string, type: string): boolean {
		return this.#findByAddress(network, address)?.type === type;
	}
}
