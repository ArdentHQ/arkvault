import { Coins, Networks } from "@ardenthq/sdk";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { ICoinService, IDataRepository } from "./contracts.js";
import { NetworkHostSelectorFactory } from "./environment.models.js";
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
				if (children !== undefined) {
					for (const child of Object.keys(children)) {
						result[coin].push(`${network}.${child}`);
					}
				} else {
					result[coin].push(network);
				}
			}
		}

		return Object.entries(result);
	}

	/** {@inheritDoc ICoinService.get} */
	public get(coin: string, network: string): Coins.Coin {
		const instance: Coins.Coin | undefined = this.#dataRepository.get<Coins.Coin>(`${coin}.${network}`);

		if (instance === undefined) {
			throw new Error(`An instance for [${coin}.${network}] does not exist.`);
		}

		return instance;
	}

	/** {@inheritDoc ICoinService.set} */
	public set(coin: string, network: string, options: object = {}): Coins.Coin {
		const cacheKey = `${coin}.${network}`;

		if (this.#dataRepository.has(cacheKey)) {
			return this.#dataRepository.get(cacheKey)!;
		}

		const instance = this.makeInstance(coin, network, options);

		this.#dataRepository.set(cacheKey, instance);

		return instance;
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
	public makeInstance(coin: string, network: string, options: object = {}): Coins.Coin {
		return Coins.CoinFactory.make(this.#getCoinBundle(coin), {
			hostSelector: container.get<NetworkHostSelectorFactory>(Identifiers.NetworkHostSelectorFactory)(
				this.#profile,
			),
			httpClient: container.get(Identifiers.HttpClient),
			ledgerTransportFactory: container.get(Identifiers.LedgerTransportFactory),
			network,
			...options,
		});
	}

	/** {@inheritDoc ICoinService.availableNetworks} */
	public availableNetworks() {
		const networks = this.#coinManifests().map((manifest) => {
			const network = Object.values(manifest.networks)[0];
			return new Networks.Network(manifest, network);
		});

		return networks.sort((a, b) => a.displayName().localeCompare(b.displayName()));
	}

	/** {@inheritDoc ICoinService.register} */
	public register(): void {
		for (const manifest of this.#coinManifests()) {
			for (const network of Object.values(manifest.networks)) {
				this.set(manifest.name, network.id, { networks: manifest.networks });
			}
		}
	}

	#getCoinBundle(coin: string): Coins.CoinBundle {
		return container.get<Coins.CoinBundle>(Identifiers.Coins)[coin];
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
