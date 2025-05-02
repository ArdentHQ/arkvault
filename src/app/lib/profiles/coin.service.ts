import { Coins, Networks } from "@/app/lib/sdk";

import { ICoinService, IDataRepository } from "./contracts.js";
import { IProfile } from "./profile.contract.js";

export class CoinService implements ICoinService {
	readonly #profile: IProfile;
	readonly #dataRepository: IDataRepository;

	public constructor(profile: IProfile, dataRepository: IDataRepository) {
		this.#profile = profile;
		this.#dataRepository = dataRepository;
	}

	/** {@inheritDoc ICoinService.all} */
	public all(): Record<string, Coins.Coin> {
		return this.#dataRepository.all() as Record<string, Coins.Coin>;
	}

	/** {@inheritDoc ICoinService.values} */
	public values(): Coins.Coin[] {
		return this.#dataRepository.values();
	}

	/** {@inheritDoc ICoinService.entries} */
	public entries(): [string, string[]][] {
		const result: Record<string, string[]> = {};

		for (const [coin, networks] of Object.entries(this.all())) {
			result[coin] = [];

			for (const [network, children] of Object.entries(networks)) {
				if (children === undefined) {
					result[coin].push(network);
				} else {
					for (const child of Object.keys(children)) {
						result[coin].push(`${network}.${child}`);
					}
				}
			}
		}

		return Object.entries(result);
	}

	/** {@inheritDoc ICoinService.has} */
	public has(coin: string, network: string): boolean {
		return this.#dataRepository.has(`${coin}.${network}`);
	}

	/** {@inheritDoc ICoinService.flush} */
	public flush(): void {
		this.#dataRepository.flush();
	}

	/** {@inheritDoc ICoinService.set} */

	/** {@inheritDoc ICoinService.availableNetworks} */
	public availableNetworks() {
		const networks = this.#coinManifests().map((manifest) => {
			const network = Object.values(manifest.networks)[0];
			return new Networks.Network(manifest, network);
		});

		return networks.sort((a, b) => a.displayName().localeCompare(b.displayName()));
	}

	#coinManifests() {
		const networks = this.#profile.networks().all();

		return Object.keys(networks).flatMap((name) => {
			const manifests: Networks.CoinManifest[] = [];

			for (const network of Object.values(networks[name])) {
				manifests.push({ name: network.coin, networks: { [network.id]: network } });
			}

			return manifests;
		});
	}
}
