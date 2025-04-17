import { Coins } from "@ardenthq/sdk";
import { sortBy, sortByDesc } from "@ardenthq/sdk-helpers";
import retry from "p-retry";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import {
	IDataRepository,
	IProfile,
	IReadWriteWallet,
	IWalletData,
	IWalletExportOptions,
	IWalletRepository,
	WalletData,
} from "./contracts.js";
import { DataRepository } from "./data.repository";
import { pqueue } from "./helpers/queue.js";
import { Wallet } from "./wallet.js";

export class WalletRepository implements IWalletRepository {
	readonly #profile: IProfile;
	readonly #data: IDataRepository = new DataRepository();
	#dataRaw: Record<string, any> = {};

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IWalletRepository.all} */
	public all(): Record<string, IReadWriteWallet> {
		return this.#data.all() as Record<string, IReadWriteWallet>;
	}

	/** {@inheritDoc IWalletRepository.first} */
	public first(): IReadWriteWallet {
		return this.#data.first();
	}

	/** {@inheritDoc IWalletRepository.last} */
	public last(): IReadWriteWallet {
		return this.#data.last();
	}

	/** {@inheritDoc IWalletRepository.allByCoin} */
	public allByCoin(): Record<string, Record<string, IReadWriteWallet>> {
		const result = {};

		for (const [id, wallet] of Object.entries(this.all())) {
			const coin: string = wallet.currency();

			if (!result[coin]) {
				result[coin] = {};
			}

			result[coin][id] = wallet;
		}

		return result;
	}

	/** {@inheritDoc IWalletRepository.keys} */
	public keys(): string[] {
		return this.#data.keys();
	}

	/** {@inheritDoc IWalletRepository.values} */
	public values(): IReadWriteWallet[] {
		return this.#data.values();
	}

	/** {@inheritDoc IWalletRepository.valuesWithCoin} */
	public valuesWithCoin(): IReadWriteWallet[] {
		return this.values().filter((wallet: IReadWriteWallet) => !wallet.isMissingCoin());
	}

	/** {@inheritDoc IWalletRepository.findById} */
	public findById(id: string): IReadWriteWallet {
		const wallet: IReadWriteWallet | undefined = this.#data.get(id);

		if (!wallet) {
			throw new Error(`Failed to find a wallet for [${id}].`);
		}

		return wallet;
	}

	/** {@inheritDoc IWalletRepository.filterByAddress} */
	public filterByAddress(address: string): IReadWriteWallet[] {
		return this.values().filter((wallet: IReadWriteWallet) => wallet.address() === address);
	}

	/** {@inheritDoc IWalletRepository.findByAddressWithNetwork} */
	public findByAddressWithNetwork(address: string, network: string): IReadWriteWallet | undefined {
		return this.values().find(
			(wallet: IReadWriteWallet) => wallet.address() === address && wallet.networkId() === network,
		);
	}

	/** {@inheritDoc IWalletRepository.findByPublicKey} */
	public findByPublicKey(publicKey: string): IReadWriteWallet | undefined {
		return this.values().find((wallet: IReadWriteWallet) => wallet.publicKey() === publicKey);
	}

	/** {@inheritDoc IWalletRepository.findByCoin} */
	public findByCoin(coin: string): IReadWriteWallet[] {
		return this.values().filter(
			(wallet: IReadWriteWallet) => wallet.coin().manifest().get<string>("name") === coin,
		);
	}

	/** {@inheritDoc IWalletRepository.findByCoinWithNetwork} */
	public findByCoinWithNetwork(coin: string, network: string): IReadWriteWallet[] {
		return this.values().filter(
			(wallet: IReadWriteWallet) =>
				wallet.coinId().toLowerCase() === coin.toLowerCase() && wallet.networkId() === network,
		);
	}

	/** {@inheritDoc IWalletRepository.findByCoinWithNethash} */
	public findByCoinWithNethash(coin: string, nethash: string): IReadWriteWallet[] {
		return this.values().filter(
			(wallet: IReadWriteWallet) =>
				wallet.coinId().toLowerCase() === coin.toLowerCase() && wallet.network().meta().nethash === nethash,
		);
	}

	/** {@inheritDoc IWalletRepository.findByAlias} */
	public findByAlias(alias: string): IReadWriteWallet | undefined {
		return this.values().find(
			(wallet: IReadWriteWallet) => (wallet.alias() || "").toLowerCase() === alias.toLowerCase(),
		);
	}

	/** {@inheritDoc IWalletRepository.push} */
	public push(wallet: IReadWriteWallet, options: { force: boolean } = { force: false }): IReadWriteWallet {
		if (!options.force && this.findByAddressWithNetwork(wallet.address(), wallet.networkId())) {
			throw new Error(`The wallet [${wallet.address()}] with network [${wallet.networkId()}] already exists.`);
		}

		this.#data.set(wallet.id(), wallet);

		this.#profile.status().markAsDirty();

		return wallet;
	}

	/** {@inheritDoc IWalletRepository.update} */
	public update(id: string, data: { alias?: string }): void {
		const result = this.findById(id);

		if (data.alias) {
			const wallets: IReadWriteWallet[] = this.values();

			for (const wallet of wallets) {
				if (wallet.id() === id || !wallet.alias()) {
					continue;
				}

				if (wallet.alias()!.toLowerCase() === data.alias.toLowerCase()) {
					throw new Error(`The wallet with alias [${data.alias}] already exists.`);
				}
			}

			result.mutator().alias(data.alias);
		}

		this.#data.set(id, result);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IWalletRepository.has} */
	public has(id: string): boolean {
		return this.#data.has(id);
	}

	/** {@inheritDoc IWalletRepository.forget} */
	public forget(id: string): void {
		this.#data.forget(id);

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IWalletRepository.flush} */
	public flush(): void {
		this.#data.flush();

		this.#profile.status().markAsDirty();
	}

	/** {@inheritDoc IWalletRepository.count} */
	public count(): number {
		return this.keys().length;
	}

	/** {@inheritDoc IWalletRepository.toObject} */
	public toObject(
		options: IWalletExportOptions = {
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
		},
	): Record<string, IWalletData> {
		if (!options.addNetworkInformation) {
			throw new Error("This is not implemented yet");
		}

		const result: Record<string, IWalletData> = {};

		for (const [id, wallet] of Object.entries(this.#data.all())) {
			if (options.excludeLedgerWallets && wallet.isLedger()) {
				continue;
			}

			if (options.excludeEmptyWallets && wallet.balance() === 0) {
				continue;
			}

			result[id] = wallet.toObject();
		}

		return result;
	}

	/** {@inheritDoc IWalletRepository.sortBy} */
	public sortBy(column: string, direction: "asc" | "desc" = "asc"): IReadWriteWallet[] {
		// TODO: sort by balance as fiat (BigInt)

		const sortFunction = (wallet: IReadWriteWallet) => {
			if (column === "coin") {
				return wallet.currency();
			}

			if (column === "type") {
				return wallet.isStarred();
			}

			if (column === "balance") {
				return wallet.balance().toFixed(0);
			}

			return wallet[column]();
		};

		if (direction === "asc") {
			return sortBy(this.values(), sortFunction);
		}

		return sortByDesc(this.values(), sortFunction);
	}

	/** {@inheritDoc IWalletRepository.fill} */
	public async fill(struct: Record<string, IWalletData>): Promise<void> {
		this.#dataRaw = struct;

		for (const item of Object.values(struct)) {
			const { id, data, settings } = item;

			const wallet = new Wallet(id, item, this.#profile);

			wallet.data().fill(data);

			wallet.settings().fill(settings);

			const coin: string = wallet.data().get<string>(WalletData.Coin)!;
			const network: string = wallet.data().get<string>(WalletData.Network)!;
			const specification: Coins.CoinSpec = container.get<Coins.CoinSpec>(Identifiers.Coins)[coin];

			// If a client does not provide a coin instance we will not know how to restore.
			if (specification === undefined) {
				wallet.markAsMissingCoin();
				wallet.markAsMissingNetwork();
			}

			if (specification && specification.manifest.networks[network] === undefined) {
				wallet.markAsMissingNetwork();
			}

			if (!wallet.isMissingCoin() && !wallet.isMissingNetwork()) {
				await wallet.mutator().coin(coin, network, { sync: false });
			}

			wallet.mutator().avatar(wallet.address());

			wallet.markAsPartiallyRestored();

			this.push(wallet, { force: wallet.hasBeenPartiallyRestored() });
		}
	}

	/** {@inheritDoc IWalletRepository.restore} */
	public async restore(options?: { networkId?: string; ttl?: number }): Promise<void> {
		const syncWallets = (wallets: object): Promise<IReadWriteWallet[]> =>
			pqueue(
				[...Object.values(wallets)].map((wallet) => () => this.#restoreWallet(wallet, { ttl: options?.ttl })),
			);

		const earlyWallets: Record<string, object> = {};
		const laterWallets: Record<string, object> = {};

		for (const [id, wallet] of Object.entries(this.#dataRaw)) {
			const nid: string = wallet.data[WalletData.Network];

			if (options?.networkId && nid !== options?.networkId) {
				continue;
			}

			if (earlyWallets[nid] === undefined) {
				earlyWallets[nid] = wallet;
			} else {
				laterWallets[id] = wallet;
			}
		}

		// These wallets will be synced first so that we have cached coin instances for consecutive sync operations.
		// This will help with coins like ARK to prevent multiple requests for configuration and syncing operations.
		await syncWallets(earlyWallets);

		// These wallets will be synced last because they can reuse already existing coin instances from the warmup wallets
		// to avoid duplicate requests which elongate the waiting time for a user before the wallet is accessible and ready.
		await syncWallets(laterWallets);
	}

	async #restoreWallet({ id, data }, options?: { ttl?: number }): Promise<void> {
		const previousWallet: IReadWriteWallet = this.findById(id);

		if (previousWallet.hasBeenPartiallyRestored()) {
			try {
				await this.#syncWalletWithNetwork(
					{
						address: data[WalletData.Address],
						coin: data[WalletData.Coin],
						network: data[WalletData.Network],
						wallet: previousWallet,
					},
					options,
				);
			} catch {
				// If we end up here the wallet had previously been
				// partially restored but we again failed to fully
				// restore it which means the has to consumer try again.
			}
		}
	}

	async #syncWalletWithNetwork(
		{
			address,
			coin,
			network,
			wallet,
		}: {
			wallet: IReadWriteWallet;
			coin: string;
			network: string;
			address: string;
		},
		options?: { ttl?: number },
	): Promise<void> {
		await retry(
			async () => {
				await wallet.mutator().coin(coin, network);
				await wallet.mutator().address({ address });
				await wallet.synchroniser().identity(options);
			},
			{
				onFailedAttempt: (error) =>
					/* istanbul ignore next */
					console.log(
						`Attempt #${error.attemptNumber} to restore [${address}] failed. There are ${error.retriesLeft} retries left.`,
					),
				retries: 3,
			},
		);
	}
}
