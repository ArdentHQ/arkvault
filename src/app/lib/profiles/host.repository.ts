import { DataRepository } from "./data.repository.js";
import { Host, HostMap, HostSet, IHostRepository } from "./host.repository.contract.js";
import { IProfile } from "./profile.contract.js";

export class HostRepository implements IHostRepository {
	readonly #profile: IProfile;
	#data: DataRepository = new DataRepository();

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IHostRepository.all} */
	public all(): HostMap {
		return this.#data.all() as HostMap;
	}

	/** {@inheritDoc HostRepository.get} */
	public allByNetwork(network: string): HostSet {
		return this.#data.get(network, []) ?? [];
	}

	/** {@inheritDoc HostRepository.push} */
	public push({ host, name, network }: { host: Host; name: string; network: string }): HostSet {
		if (!this.#data.has(network)) {
			this.#data.set(network, []);
		}

		host.custom = true;

		this.#data.get<HostSet>(network)?.push({ host, name });

		this.#profile.status().markAsDirty();

		return this.allByNetwork(network);
	}

	/** {@inheritDoc HostRepository.fill} */
	public fill(entries: object): void {
		this.#data.fill(entries);
	}

	/** {@inheritDoc HostRepository.forget} */
	public forget(network: string, index?: number): void {
		if (index !== undefined) {
			this.#data.forgetIndex(network, index);
		} else {
			this.#data.forget(network);
		}

		this.#profile.status().markAsDirty();
	}
}
