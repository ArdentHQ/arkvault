import { Collections, DTO } from "@/app/lib/sdk";

import { IProfile, IUsernamesService } from "./contracts.js";
import { ClientService } from "@/app/lib/mainsail/client.service.js";
import { ConfigRepository } from "@/app/lib/sdk/coins.js";

type UsernameRegistry = Record<string, Collections.UsernameDataCollection>;

export class UsernamesService implements IUsernamesService {
	readonly #registry: UsernameRegistry = {};
	#config: ConfigRepository;
	#profile: IProfile;

	constructor({ config, profile }: { config: ConfigRepository, profile: IProfile }) {
		this.#config = config;
		this.#profile = profile;
	}

	public async syncUsernames(profile: IProfile, coin: string, network: string, addresses: string[]): Promise<void> {
		const clientService = new ClientService({ config: this.#config, profile: this.#profile });
		const collection = await clientService.usernames(addresses);

		if (this.#registry[network]) {
			const existingCollection = this.#registry[network];
			const mergedItems = [...existingCollection.items(), ...collection.items()];
			const uniqueItems = mergedItems.filter(
				(item, index, self) => index === self.findIndex((t) => t.address() === item.address()),
			);
			this.#registry[network] = new Collections.UsernameDataCollection(uniqueItems);
		} else {
			this.#registry[network] = collection;
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
