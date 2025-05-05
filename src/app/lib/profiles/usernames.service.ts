import { Collections, DTO, Networks } from "@/app/lib/sdk";

import { IProfile, IUsernamesService } from "./contracts.js";
import { ClientService } from "@/app/lib/mainsail/client.service.js";
import { ConfigRepository } from "@/app/lib/sdk/coins.js";

type UsernameRegistry = Record<string, Collections.UsernameDataCollection>;

export class UsernamesService implements IUsernamesService {
	readonly #registry: UsernameRegistry = {};
	#config: ConfigRepository;
	#profile: IProfile;
	#network: Networks.Network;

	constructor({ config, profile }: { config: ConfigRepository, profile: IProfile }) {
		this.#config = config;
		this.#profile = profile;
		this.#network = profile.activeNetwork();
	}

	public async syncUsernames(addresses: string[]): Promise<void> {
		const clientService = new ClientService({ config: this.#config, profile: this.#profile });
		const collection = await clientService.usernames(addresses);

		if (this.#registry[this.#network.id()]) {
			const existingCollection = this.#registry[this.#network.id()];
			const mergedItems = [...existingCollection.items(), ...collection.items()];
			const uniqueItems = mergedItems.filter(
				(item, index, self) => index === self.findIndex((t) => t.address() === item.address()),
			);
			this.#registry[this.#network.id()] = new Collections.UsernameDataCollection(uniqueItems);
		} else {
			this.#registry[this.#network.id()] = collection;
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
