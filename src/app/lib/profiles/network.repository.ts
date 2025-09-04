import { manifest } from "@/app/lib/mainsail/manifest.js";
import { Networks } from "@/app/lib/mainsail";
import { NetworkManifest } from "@/app/lib/mainsail/network.models";
import { DataRepository } from "./data.repository.js";
import { Network, NetworkMap } from "./network.repository.contract.js";
import { IProfile } from "./profile.contract.js";

export class NetworkRepository {
	readonly #profile: IProfile;
	#data: DataRepository = new DataRepository();

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	public all(): NetworkMap {
		return this.#data.all() as NetworkMap;
	}

	public allByCoin(coin: string): Network[] {
		const networks: Network[] = Object.values(this.#data.all()[coin.toLowerCase()] ?? []);

		return networks.filter((network: Network) => network.coin.toLowerCase() === coin.toLowerCase());
	}

	public get(network: string): Network {
		const hosts: Network | undefined = this.#data.get(network);

		if (!hosts) {
			throw new Error(`Failed to find hosts that match [${network}].`);
		}

		return hosts;
	}

	public push(network: Network): Network {
		this.#data.set(network.id, network);

		this.#profile.status().markAsDirty();

		return this.get(network.id);
	}

	public fill(entries: object): void {
		this.#data.fill(entries);
	}

	public forget(network: string): void {
		this.get(network);

		this.#data.forget(network);

		this.#profile.status().markAsDirty();
	}

	public availableNetworks(): Networks.Network[] {
		const networks = manifest.networks as Record<string, NetworkManifest>;

		return Object.values(networks)
			.map((network) => new Networks.Network(manifest, network, this.#profile))
			.sort((a, b) => a.displayName().localeCompare(b.displayName()));
	}
}
