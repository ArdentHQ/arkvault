import { Coins, Contracts } from "@ardenthq/sdk";

import { IDataRepository, IDelegateService, IProfile, IReadOnlyWallet, IReadWriteWallet } from "./contracts.js";
import { DataRepository } from "./data.repository";
import { IDelegateSyncer, ParallelDelegateSyncer, SerialDelegateSyncer } from "./delegate-syncer.service.js";
import { pqueueSettled } from "./helpers/queue.js";
import { ReadOnlyWallet } from "./read-only-wallet.js";

export class DelegateService implements IDelegateService {
	readonly #dataRepository: IDataRepository = new DataRepository();

	/** {@inheritDoc IDelegateService.all} */
	public all(coin: string, network: string): IReadOnlyWallet[] {
		const result: any[] | undefined = this.#dataRepository.get(`${coin}.${network}.delegates`);

		if (result === undefined) {
			throw new Error(
				`The delegates for [${coin}.${network}] have not been synchronized yet. Please call [syncDelegates] before using this method.`,
			);
		}

		return result.map((delegate) => this.#mapDelegate(delegate));
	}

	/** {@inheritDoc IDelegateService.findByAddress} */
	public findByAddress(coin: string, network: string, address: string): IReadOnlyWallet {
		return this.#findDelegateByAttribute(coin, network, "address", address);
	}

	/** {@inheritDoc IDelegateService.findByPublicKey} */
	public findByPublicKey(coin: string, network: string, publicKey: string): IReadOnlyWallet {
		return this.#findDelegateByAttribute(coin, network, "publicKey", publicKey);
	}

	/** {@inheritDoc IDelegateService.findByUsername} */
	public findByUsername(coin: string, network: string, username: string): IReadOnlyWallet {
		return this.#findDelegateByAttribute(coin, network, "username", username);
	}

	/** {@inheritDoc IDelegateService.sync} */
	public async sync(profile: IProfile, coin: string, network: string): Promise<void> {
		const instance: Coins.Coin = profile.coins().set(coin, network);

		if (!instance.hasBeenSynchronized()) {
			await instance.__construct();
		}

		// TODO injection here based on coin config would be awesome
		const syncer: IDelegateSyncer = instance.network().meta().fastDelegateSync
			? new ParallelDelegateSyncer(instance.client())
			: new SerialDelegateSyncer(instance.client());

		const result: Contracts.WalletData[] = await syncer.sync();

		this.#dataRepository.set(
			`${coin}.${network}.delegates`,
			result.map((delegate: Contracts.WalletData) => ({
				...delegate.toObject(),
				explorerLink: instance.link().wallet(delegate.address()),
				governanceIdentifier: instance.network().delegateIdentifier(),
			})),
		);
	}

	/** {@inheritDoc IDelegateService.syncAll} */
	public async syncAll(profile: IProfile): Promise<void> {
		const promises: (() => Promise<void>)[] = [];

		for (const [coin, networks] of profile.coins().entries()) {
			for (const network of networks) {
				promises.push(() => this.sync(profile, coin, network));
			}
		}

		await pqueueSettled(promises);
	}

	/** {@inheritDoc IDelegateService.map} */
	public map(wallet: IReadWriteWallet, publicKeys: string[]): IReadOnlyWallet[] {
		if (publicKeys.length === 0) {
			return [];
		}

		return publicKeys
			.map((publicKey: string) => this.mapByIdentifier(wallet, publicKey))
			.filter(Boolean) as IReadOnlyWallet[];
	}

	/** {@inheritDoc IDelegateService.map} */
	public mapByIdentifier(wallet: IReadWriteWallet, identifier: string): IReadOnlyWallet | undefined {
		try {
			let delegate: IReadOnlyWallet | undefined;

			try {
				delegate = this.findByPublicKey(wallet.coinId(), wallet.networkId(), identifier);
			} catch {
				delegate = this.findByAddress(wallet.coinId(), wallet.networkId(), identifier);
			}

			return new ReadOnlyWallet({
				address: delegate.address(),
				explorerLink: wallet.link().wallet(delegate.address()),
				governanceIdentifier: delegate.governanceIdentifier(),
				isDelegate: delegate.isDelegate(),
				isResignedDelegate: delegate.isResignedDelegate(),
				publicKey: delegate.publicKey(),
				rank: delegate.rank(),
				username: delegate.username(),
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
			isDelegate: delegate.isDelegate,
			isResignedDelegate: delegate.isResignedDelegate,
			publicKey: delegate.publicKey,
			rank: delegate.rank as unknown as number,
			username: delegate.username,
		});
	}
}
