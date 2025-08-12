import { Contracts, Networks } from "@/app/lib/mainsail";

import { IDataRepository, IValidatorService, IProfile, IReadOnlyWallet, IReadWriteWallet } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { IValidatorSyncer, ParallelValidatorSyncer, SerialValidatorSyncer } from "./validator-syncer.service.js";
import { pqueueSettled } from "./helpers/queue.js";
import { ReadOnlyWallet } from "./read-only-wallet.js";
import { ClientService } from "@/app/lib/mainsail/client.service.js";
import { LinkService } from "@/app/lib/mainsail/link.service.js";
import { Cache } from "@/app/lib/mainsail/cache.js";

export class ValidatorService implements IValidatorService {
	readonly #dataRepository: IDataRepository = new DataRepository();
	readonly #cache = new Cache(300); // 5-minute TTL in seconds
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IValidatorService.all} */
	public all(network: string): IReadOnlyWallet[] {
		const result: any[] | undefined = this.#dataRepository.get(`${network}.validators`);

		if (result === undefined) {
			throw new Error(
				`The validators for [${network}] have not been synchronized yet. Please call [syncValidators] before using this method.`,
			);
		}

		return result.map((validator) => this.#mapValidator(validator));
	}

	/** {@inheritDoc IValidatorService.findByAddress} */
	public findByAddress(network: string, address: string): IReadOnlyWallet {
		return this.#findValidatorByAttribute(network, "address", address);
	}

	/** {@inheritDoc IValidatorService.findByPublicKey} */
	public findByPublicKey(network: string, publicKey: string): IReadOnlyWallet {
		return this.#findValidatorByAttribute(network, "publicKey", publicKey);
	}

	/** {@inheritDoc IValidatorService.findByUsername} */
	public findByUsername(network: string, username: string): IReadOnlyWallet {
		return this.#findValidatorByAttribute(network, "username", username);
	}

	/** {@inheritDoc IValidatorService.sync} */
	public async sync(profile: IProfile, network: string, options?: { force?: boolean }): Promise<void> {
		const cacheKey = `${network}.validators`;

		if (options?.force) {
			this.#cache.forget(cacheKey);
		}

		const cached = await this.#cache.remember(cacheKey, async () => {
			const clientService = new ClientService({ config: profile.activeNetwork().config(), profile });
			const syncer: IValidatorSyncer = profile.activeNetwork().meta().fastValidatorSync
				? new ParallelValidatorSyncer(clientService)
				: new SerialValidatorSyncer(clientService);

			const result: Contracts.WalletData[] = await syncer.sync({ limit: 100 });

			return result.map((validator: Contracts.WalletData) => ({
				...validator.toObject(),
				explorerLink: new LinkService({ config: profile.activeNetwork().config(), profile }).wallet(
					validator.address(),
				),
				governanceIdentifier: profile.activeNetwork().validatorIdentifier(),
			}));
		});

		this.#dataRepository.set(cacheKey, cached);
	}

	/** {@inheritDoc IValidatorService.syncAll} */
	public async syncAll(profile: IProfile): Promise<void> {
		const promises: (() => Promise<void>)[] = [];

		for (const network of profile.availableNetworks()) {
			promises.push(() => this.sync(profile, network.id()));
		}

		await pqueueSettled(promises);
	}

	/** {@inheritDoc IValidatorService.map} */
	public map(wallet: IReadWriteWallet, publicKeys: string[]): IReadOnlyWallet[] {
		if (publicKeys.length === 0) {
			return [];
		}

		return publicKeys
			.map((publicKey: string) => this.mapByIdentifier(wallet, publicKey))
			.filter(Boolean) as IReadOnlyWallet[];
	}

	/** {@inheritDoc IValidatorService.map} */
	public mapByIdentifier(wallet: IReadWriteWallet, identifier: string): IReadOnlyWallet | undefined {
		try {
			let validator: IReadOnlyWallet | undefined;

			try {
				validator = this.findByPublicKey(wallet.networkId(), identifier);
			} catch {
				validator = this.findByAddress(wallet.networkId(), identifier);
			}

			return new ReadOnlyWallet({
				address: validator.address(),
				explorerLink: wallet.link().wallet(validator.address()),
				governanceIdentifier: validator.governanceIdentifier(),
				isLegacyValidator: validator.isLegacyValidator(),
				isResignedValidator: validator.isResignedValidator(),
				isValidator: validator.isValidator(),
				publicKey: validator.publicKey(),
				rank: validator.rank(),
				username: validator.username(),
			});
		} catch {
			return undefined;
		}
	}

	#findValidatorByAttribute(network: string, key: string, value: string): IReadOnlyWallet {
		const result = this.all(network).find((validator) => validator[key]() === value);

		if (result === undefined) {
			throw new Error(`No validator for ${key} with value ${value} could be found.`);
		}

		return result;
	}

	#mapValidator(validator: Record<string, any>): IReadOnlyWallet {
		return new ReadOnlyWallet({
			address: validator.address,
			explorerLink: validator.explorerLink,
			governanceIdentifier: validator.governanceIdentifier,
			isLegacyValidator: validator.isLegacyValidator,
			isResignedValidator: validator.isResignedValidator,
			isValidator: validator.isValidator,
			publicKey: validator.publicKey,
			rank: validator.rank as unknown as number,
			username: validator.username,
		});
	}

	public async publicKeyExists(publicKey: string, network: Networks.Network): Promise<boolean> {
		if (publicKey.length === 0) {
			return false;
		}

		const publicApiEndpoint = network.config().host("full", this.#profile);
		const response = await fetch(`${publicApiEndpoint}?attributes.validatorPublicKey=${publicKey}`);

		console.log({ response })
		if (response.status !== 404) {
			const data = await response.json();

			if (data.meta?.count > 0) {
				throw new Error("Public key has been used already!");
			}
		}

		return true;
	}
}
