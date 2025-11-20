import { sortByDesc } from "@/app/lib/helpers";

import { INotificationTypes, IProfile, IProfileTransactionNotificationService } from "./contracts.js";
import { INotification, INotificationRepository } from "./notification.repository.contract.js";
import { AggregateQuery } from "./transaction.aggregate.contract.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";
import { Cache } from "@/app/lib/mainsail/cache.js";

export class ProfileTransactionNotificationService implements IProfileTransactionNotificationService {
	readonly #profile: IProfile;
	readonly #allowedTypes: string[];
	readonly #notifications: INotificationRepository;
	readonly #defaultLimit: number;
	readonly #cache: Cache;
	#transactions: Record<string, ExtendedConfirmedTransactionData> = {};
	#isSyncing: boolean;

	private static readonly CACHE_TTL_SECONDS = 24 * 60 * 60;

	public constructor(profile: IProfile, notificationRepository: INotificationRepository) {
		this.#defaultLimit = 10;
		this.#profile = profile;
		this.#allowedTypes = ["transfer", "multiPayment"];
		this.#notifications = notificationRepository;
		this.#isSyncing = false;
		this.#cache = new Cache(ProfileTransactionNotificationService.CACHE_TTL_SECONDS);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.findByTransactionId} */
	public findByTransactionId(transactionId: string) {
		return this.#notifications.findByTransactionId(transactionId);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.has} */
	public has(transactionId: string) {
		return !!this.#notifications.findByTransactionId(transactionId);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.forget} */
	public forget(transactionId: string): void {
		for (const { id, meta } of this.#notifications.values()) {
			if (transactionId === meta.transactionId) {
				this.#notifications.forget(id);
				delete this.#transactions[transactionId];
			}
		}

		void this.#cache.remember(this.#cacheKey(), Object.values(this.#transactions));
	}

	/** {@inheritDoc IProfileTransactionNotificationService.forgetByRecipient} */
	public forgetByRecipient(address: string): void {
		for (const { id, meta } of this.#notifications.filterByType(INotificationTypes.Transaction)) {
			if ([...meta.recipients].includes(address)) {
				this.#notifications.forget(id);
				delete this.#transactions[meta.transactionId];
			}
		}

		void this.#cache.remember(this.#cacheKey(), Object.values(this.#transactions));
	}

	/** {@inheritDoc IProfileTransactionNotificationService.recent} */
	public recent(limit?: number) {
		return sortByDesc(
			this.#notifications.filterByType(INotificationTypes.Transaction),
			(notification) => notification.meta.timestamp,
		).slice(0, limit || this.#defaultLimit);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.markAsRead} */
	public markAsRead(transactionId: string) {
		const notification: INotification | undefined = this.findByTransactionId(transactionId);

		if (!notification) {
			return;
		}

		this.#notifications.markAsRead(notification.id);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.markAsRead} */
	public markAsRemoved(transactionId: string) {
		const notification: INotification | undefined = this.findByTransactionId(transactionId);

		if (!notification) {
			return;
		}

		this.#notifications.markAsRemoved(notification.id);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.markAllAsRead} */
	public markAllAsRead() {
		for (const notification of this.#notifications.unread()) {
			if (notification.type === INotificationTypes.Transaction) {
				this.#notifications.markAsRead(notification.id);
			}
		}
	}

	public markAllAsRemoved() {
		for (const notification of this.#notifications.values()) {
			if (notification.type === INotificationTypes.Transaction) {
				this.#notifications.markAsRemoved(notification.id);
			}
		}
	}

	/** {@inheritDoc IProfileTransactionNotificationService.hydrateFromCache} */
	public async hydrateFromCache(): Promise<void> {
		const cached = await this.#cache.remember(this.#cacheKey(), async () => Object.values(this.#transactions));

		if (Array.isArray(cached) && cached.length > 0) {
			this.#storeTransactions(cached as ExtendedConfirmedTransactionData[]);
		}
	}

	/** {@inheritDoc IProfileTransactionNotificationService.sync} */
	public async sync(queryInput?: AggregateQuery) {
		this.#isSyncing = true;

		try {
			this.#profile.transactionAggregate().flush("received");

			const transactions: ExtendedConfirmedTransactionDataCollection = await this.#profile
				.transactionAggregate()
				.received({
					cursor: 1,
					limit: this.#defaultLimit,
					to: this.#getToAddresses().join(","),
					...queryInput,
				});

			for (const transaction of this.#filterUnseen(transactions.items())) {
				this.#notifications.push({
					meta: {
						recipients: [
							transaction.to(),
							...transaction.recipients().map((recipient) => recipient.address),
						],
						timestamp: transaction.timestamp()?.toUNIX(),
						transactionId: transaction.hash(),
					},
					read_at: undefined,
					type: INotificationTypes.Transaction,
				});
			}

			this.#storeTransactions(transactions.items());

			await this.#cache.remember(this.#cacheKey(), Object.values(this.#transactions));
		} finally {
			this.#isSyncing = false;
		}
	}

	/** {@inheritDoc IProfileTransactionNotificationService.transactions} */
	public transactions(limit?: number): ExtendedConfirmedTransactionData[] {
		return sortByDesc(Object.values(this.#transactions), (transaction) => transaction.timestamp()?.toUNIX()).slice(
			0,
			limit || this.#defaultLimit,
		);
	}

	public active(limit?: number): ExtendedConfirmedTransactionData[] {
		const transactions = this.transactions(limit)
		return transactions.filter(transaction => {
			const notification = this.#notifications.findByTransactionId(transaction.hash())

			if (notification) {
				return !notification.isRemoved;
			}

			return true
		})
	}

	/** {@inheritDoc IProfileTransactionNotificationService.transaction} */
	public transaction(transactionId: string): ExtendedConfirmedTransactionData | undefined {
		return this.#transactions[transactionId];
	}

	/** {@inheritDoc IProfileTransactionNotificationService.isSyncing} */
	public isSyncing(): boolean {
		return this.#isSyncing;
	}

	#cacheKey(): string {
		const networkIds = this.#profile
			.wallets()
			.values()
			.map((w) => w.network().id())
			.join(",");
		return `notifications.${this.#profile.id()}.transactions::${networkIds}`;
	}

	#isRecipient(transaction: ExtendedConfirmedTransactionData): boolean {
		return [transaction.to(), ...transaction.recipients().map((recipient) => recipient.address)].some(
			(address: string) =>
				!!this.#profile.wallets().findByAddressWithNetwork(address, transaction.wallet().networkId()),
		);
	}

	#filterUnseen(transactions: ExtendedConfirmedTransactionData[]): ExtendedConfirmedTransactionData[] {
		const result: ExtendedConfirmedTransactionData[] = [];

		for (const transaction of transactions) {
			const existingNotification = this.#notifications.findByTransactionId(transaction.hash())
			if (existingNotification && existingNotification.isRemoved) {
				continue;
			}

			if (!this.#allowedTypes.includes(transaction.type())) {
				continue;
			}

			if (!this.#isRecipient(transaction)) {
				continue;
			}

			if (this.has(transaction.hash())) {
				continue;
			}

			result.push(transaction);
		}

		return result;
	}

	#getToAddresses(): string[] {
		const activeNetwork = this.#profile.activeNetwork();

		const availableWallets = this.#profile
			.wallets()
			.values()
			.filter((wallet) => wallet.network().id() === activeNetwork.id());

		return availableWallets.map((wallet) => wallet.address());
	}

	#storeTransactions(transactions: ExtendedConfirmedTransactionData[]): void {
		const result: Record<string, ExtendedConfirmedTransactionData> = {};

		for (const transaction of transactions) {
			if (!this.has(transaction.hash())) {
				continue;
			}

			result[transaction.hash()] = transaction;
		}

		this.#transactions = result;
	}
}
