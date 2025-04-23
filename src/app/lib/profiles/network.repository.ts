import { DataRepository } from "./data.repository.js";
import { INetworkRepository, Network, NetworkMap } from "./network.repository.contract.js";
import { IProfile } from "./profile.contract.js";

export class NetworkRepository implements INetworkRepository {
	readonly #profile: IProfile;
	#data: DataRepository = new DataRepository();

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc INetworkRepository.all} */
	public all(): NetworkMap {
		return this.#data.all() as NetworkMap;
	}

	/** {@inheritDoc INetworkRepository.allByCoin} */
	public allByCoin(coin: string): Network[] {
		const networks: Network[] = Object.values(this.#data.all()[coin.toLowerCase()] ?? []);

		return networks.filter((network: Network) => network.coin.toLowerCase() === coin.toLowerCase());
	}

	/** {@inheritDoc NetworkRepository.get} */
	public get(network: string): Network {
		const hosts: Network | undefined = this.#data.get(network);

		if (!hosts) {
			throw new Error(`Failed to find hosts that match [${network}].`);
		}

		return hosts;
	}

	/** {@inheritDoc NetworkRepository.push} */
	public push(network: Network): Network {
		this.#data.set(network.id, network);

		this.#profile.status().markAsDirty();

		return this.get(network.id);
	}

	/** {@inheritDoc NetworkRepository.fill} */
	public fill(entries: object): void {
		this.#data.fill(entries);
	}

	/** {@inheritDoc NetworkRepository.forget} */
	public forget(network: string): void {
		this.get(network);

		this.#data.forget(network);

		this.#profile.status().markAsDirty();
	}
}
