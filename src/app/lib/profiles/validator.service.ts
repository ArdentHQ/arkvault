import { Coins, Contracts } from "@/app/lib/sdk";

import { IDataRepository, IValidatorService, IProfile, IReadOnlyWallet, IReadWriteWallet } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { IValidatorSyncer, ParallelValidatorSyncer, SerialValidatorSyncer } from "./validator-syncer.service.js";
import { pqueueSettled } from "./helpers/queue.js";
import { ReadOnlyWallet } from "./read-only-wallet.js";

export class ValidatorService implements IValidatorService {
	readonly #dataRepository: IDataRepository = new DataRepository();

	/** {@inheritDoc IValidatorService.all} */
	public all(coin: string, network: string): IReadOnlyWallet[] {
		const result: any[] | undefined = this.#dataRepository.get(`${coin}.${network}.delegates`);

		if (result === undefined) {
			throw new Error(
				`The validators for [${coin}.${network}] have not been synchronized yet. Please call [syncValidators] before using this method.`,
			);
		}

		return result.map((delegate) => this.#mapDelegate(delegate));
	}

	/** {@inheritDoc IValidatorService.findByAddress} */
	public findByAddress(coin: string, network: string, address: string): IReadOnlyWallet {
		return this.#findDelegateByAttribute(coin, network, "address", address);
	}

	/** {@inheritDoc IValidatorService.findByPublicKey} */
	public findByPublicKey(coin: string, network: string, publicKey: string): IReadOnlyWallet {
		return this.#findDelegateByAttribute(coin, network, "publicKey", publicKey);
	}

	/** {@inheritDoc IValidatorService.findByUsername} */
	public findByUsername(coin: string, network: string, username: string): IReadOnlyWallet {
		return this.#findDelegateByAttribute(coin, network, "username", username);
	}

	/** {@inheritDoc IValidatorService.sync} */
	public async sync(profile: IProfile, coin: string, network: string): Promise<void> {
		const instance: Coins.Coin = profile.coins().set(coin, network);

		if (!instance.hasBeenSynchronized()) {
			await instance.__construct();
		}

		// TODO injection here based on coin config would be awesome
		const syncer: IValidatorSyncer = instance.network().meta().fastValidatorSync
			? new ParallelValidatorSyncer(instance.client())
			: new SerialValidatorSyncer(instance.client());

		const result: Contracts.WalletData[] = await syncer.sync();

		this.#dataRepository.set(
			`${coin}.${network}.validators`,
			result.map((validator: Contracts.WalletData) => ({
				...validator.toObject(),
				explorerLink: instance.link().wallet(validator.address()),
				governanceIdentifier: instance.network().validatorIdentifier(),
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
				isValidator: validator.isValidator(),
				isResignedValidator: validator.isResignedValidator(),
				publicKey: validator.publicKey(),
				rank: validator.rank(),
				username: validator.username(),
			});
		} catch {
			return undefined;
		}
	}

	#findDelegateByAttribute(coin: string, network: string, key: string, value: string): IReadOnlyWallet {
		const result = this.all(coin, network).find((delegate) => delegate[key]() === value);

		if (result === undefined) {
			throw new Error(`No delegate for ${key} with value ${value} could be found.`);
		}

		return result;
	}

	#mapDelegate(delegate: Record<string, any>): IReadOnlyWallet {
		return new ReadOnlyWallet({
			address: delegate.address,
			explorerLink: delegate.explorerLink,
			governanceIdentifier: delegate.governanceIdentifier,
			isValidator: delegate.isValidator,
			isResignedValidator: delegate.isResignedValidator,
			publicKey: delegate.publicKey,
			rank: delegate.rank as unknown as number,
			username: delegate.username,
		});
	}
}
