import { Contracts } from "@/app/lib/sdk";

import { IDataRepository, IValidatorService, IProfile, IReadOnlyWallet, IReadWriteWallet } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { IValidatorSyncer, ParallelValidatorSyncer, SerialValidatorSyncer } from "./validator-syncer.service.js";
import { pqueueSettled } from "./helpers/queue.js";
import { ReadOnlyWallet } from "./read-only-wallet.js";
import { ClientService } from "@/app/lib/mainsail/client.service.js";
import { LinkService } from "@/app/lib/mainsail/link.service.js";

export class ValidatorService implements IValidatorService {
	readonly #dataRepository: IDataRepository = new DataRepository();

	/** {@inheritDoc IValidatorService.all} */
	public all(coin: string, network: string): IReadOnlyWallet[] {
		const result: any[] | undefined = this.#dataRepository.get(`${coin}.${network}.validators`);

		if (result === undefined) {
			throw new Error(
				`The validators for [${coin}.${network}] have not been synchronized yet. Please call [syncValidators] before using this method.`,
			);
		}

		return result.map((validator) => this.#mapValidator(validator));
	}

	/** {@inheritDoc IValidatorService.findByAddress} */
	public findByAddress(coin: string, network: string, address: string): IReadOnlyWallet {
		return this.#findValidatorByAttribute(coin, network, "address", address);
	}

	/** {@inheritDoc IValidatorService.findByPublicKey} */
	public findByPublicKey(coin: string, network: string, publicKey: string): IReadOnlyWallet {
		return this.#findValidatorByAttribute(coin, network, "publicKey", publicKey);
	}

	/** {@inheritDoc IValidatorService.findByUsername} */
	public findByUsername(coin: string, network: string, username: string): IReadOnlyWallet {
		return this.#findValidatorByAttribute(coin, network, "username", username);
	}

	/** {@inheritDoc IValidatorService.sync} */
	public async sync(profile: IProfile, coin: string, network: string): Promise<void> {
		const clientService = new ClientService({ config: profile.activeNetwork().config(), profile });
		const syncer: IValidatorSyncer = profile.activeNetwork().meta().fastValidatorSync
			? new ParallelValidatorSyncer(clientService)
			: new SerialValidatorSyncer(clientService);

		const result: Contracts.WalletData[] = await syncer.sync();

		this.#dataRepository.set(
			`${coin}.${network}.validators`,
			result.map((validator: Contracts.WalletData) => ({
				...validator.toObject(),
				explorerLink: new LinkService({ config: profile.activeNetwork().config(), profile }).wallet(
					validator.address(),
				),
				governanceIdentifier: profile.activeNetwork().validatorIdentifier(),
			})),
		);
	}

	/** {@inheritDoc IValidatorService.syncAll} */
	public async syncAll(profile: IProfile): Promise<void> {
		const promises: (() => Promise<void>)[] = [];

		for (const [coin, networks] of profile.coins().entries()) {
			for (const network of networks) {
				promises.push(() => this.sync(profile, coin, network));
			}
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
				validator = this.findByPublicKey(wallet.coinId(), wallet.networkId(), identifier);
			} catch {
				validator = this.findByAddress(wallet.coinId(), wallet.networkId(), identifier);
			}

			return new ReadOnlyWallet({
				address: validator.address(),
				explorerLink: wallet.link().wallet(validator.address()),
				governanceIdentifier: validator.governanceIdentifier(),
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

	#findValidatorByAttribute(coin: string, network: string, key: string, value: string): IReadOnlyWallet {
		const result = this.all(coin, network).find((validator) => validator[key]() === value);

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
			isResignedValidator: validator.isResignedValidator,
			isValidator: validator.isValidator,
			publicKey: validator.publicKey,
			rank: validator.rank as unknown as number,
			username: validator.username,
		});
	}
}
