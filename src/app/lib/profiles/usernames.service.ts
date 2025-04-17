import { Collections, DTO } from "@ardenthq/sdk";

import { IProfile, IUsernamesService } from "./contracts.js";

type UsernameRegistry = Record<string, Collections.UsernameDataCollection>;

export class UsernamesService implements IUsernamesService {
	readonly #registry: UsernameRegistry = {};

	public async syncUsernames(profile: IProfile, coin: string, network: string, addresses: string[]): Promise<void> {
		const clientService = profile.coins().get(coin, network).client();
		const collection = await clientService.usernames(addresses);

		if (!this.#registry[network]) {
			this.#registry[network] = collection;
		} else {
			const existingCollection = this.#registry[network];
			const mergedItems = [...existingCollection.items(), ...collection.items()];
			const uniqueItems = mergedItems.filter(
				(item, index, self) => index === self.findIndex((t) => t.address() === item.address()),
			);
			this.#registry[network] = new Collections.UsernameDataCollection(uniqueItems);
		}
	}

	public username(network: string, address: string): string | undefined {
		return this.#findByAddress(network, address)?.username();
	}

	public has(network: string, address: string): boolean {
		return this.#findByAddress(network, address) !== undefined;
	}

	#findByAddress(network: string, address: string): DTO.UsernameData | undefined {
		const registry = this.#registry[network];
		if (!registry) {
			return undefined;
		}
		return registry.findByAddress(address);
	}
}
