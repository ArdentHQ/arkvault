import { Services } from "@ardenthq/sdk";
import { sortByDesc } from "@ardenthq/sdk-helpers";

import { INotificationTypes, IProfile, IProfileTransactionNotificationService, ProfileSetting } from "./contracts.js";
import { INotification, INotificationRepository } from "./notification.repository.contract.js";
import { AggregateQuery } from "./transaction.aggregate.contract.js";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection.js";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";

export class ProfileTransactionNotificationService implements IProfileTransactionNotificationService {
	readonly #profile: IProfile;
	readonly #allowedTypes: string[];
	readonly #notifications: INotificationRepository;
	readonly #defaultLimit: number;
	#transactions: Record<string, ExtendedConfirmedTransactionData> = {};
	#isSyncing: boolean;

	public constructor(profile: IProfile, notificationRepository: INotificationRepository) {
		this.#defaultLimit = 10;
		this.#profile = profile;
		this.#allowedTypes = ["transfer", "multiPayment"];
		this.#notifications = notificationRepository;
		this.#isSyncing = false;
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
	}

	/** {@inheritDoc IProfileTransactionNotificationService.forgetByRecipient} */
	public forgetByRecipient(address: string): void {
		for (const { id, meta } of this.#notifications.filterByType(INotificationTypes.Transaction)) {
			if ([...meta.recipients].includes(address)) {
				this.#notifications.forget(id);
				delete this.#transactions[meta.transactionId];
			}
		}
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

	/** {@inheritDoc IProfileTransactionNotificationService.markAllAsRead} */
	public markAllAsRead() {
		for (const notification of this.#notifications.unread()) {
			if (notification.type === INotificationTypes.Transaction) {
				this.#notifications.markAsRead(notification.id);
			}
		}
	}

	/** {@inheritDoc IProfileTransactionNotificationService.sync} */
	public async sync(queryInput?: AggregateQuery) {
		this.#isSyncing = true;

		this.#profile.transactionAggregate().flush("received");

		const transactions: ExtendedConfirmedTransactionDataCollection = await this.#profile
			.transactionAggregate()
			.received({
				cursor: 1,
				identifiers: this.#getIdentifiers(),
				limit: this.#defaultLimit,
				...(queryInput && queryInput),
			});

		for (const transaction of this.#filterUnseen(transactions.items())) {
			this.#notifications.push({
				meta: {
					recipients: [
						transaction.recipient(),
						...transaction.recipients().map((recipient) => recipient.address),
					],
					timestamp: transaction.timestamp()?.toUNIX(),
					transactionId: transaction.id(),
				},
				read_at: undefined,
				type: INotificationTypes.Transaction,
			});
		}

		this.#storeTransactions(transactions.items());

		this.#isSyncing = false;
	}

	/** {@inheritDoc IProfileTransactionNotificationService.transactions} */
	public transactions(limit?: number): ExtendedConfirmedTransactionData[] {
		return sortByDesc(Object.values(this.#transactions), (transaction) => transaction.timestamp()?.toUNIX()).slice(
			0,
			limit || this.#defaultLimit,
		);
	}

	/** {@inheritDoc IProfileTransactionNotificationService.transaction} */
	public transaction(transactionId: string): ExtendedConfirmedTransactionData | undefined {
		return this.#transactions[transactionId];
	}

	/** {@inheritDoc IProfileTransactionNotificationService.isSyncing} */
	public isSyncing(): boolean {
		return this.#isSyncing;
	}

	#isRecipient(transaction: ExtendedConfirmedTransactionData): boolean {
		return [transaction.recipient(), ...transaction.recipients().map((recipient) => recipient.address)].some(
			(address: string) =>
				!!this.#profile.wallets().findByAddressWithNetwork(address, transaction.wallet().networkId()),
		);
	}

	#filterUnseen(transactions: ExtendedConfirmedTransactionData[]): ExtendedConfirmedTransactionData[] {
		const result: ExtendedConfirmedTransactionData[] = [];

		for (const transaction of transactions) {
			if (!this.#allowedTypes.includes(transaction.type())) {
				continue;
			}

			if (!this.#isRecipient(transaction)) {
				continue;
			}

			if (this.has(transaction.id())) {
				continue;
			}

			result.push(transaction);
		}

		return result;
	}

	#getIdentifiers(): Services.WalletIdentifier[] {
		const usesTestNetworks = this.#profile.settings().get(ProfileSetting.UseTestNetworks);

		const availableWallets = this.#profile
			.wallets()
			.values()
			.filter((wallet) => wallet.network().isLive() || usesTestNetworks);

		return availableWallets.map((wallet) => ({
			type: "address",
			value: wallet.address(),
		}));
	}

	#storeTransactions(transactions: ExtendedConfirmedTransactionData[]): void {
		const result: Record<string, ExtendedConfirmedTransactionData> = {};

		for (const transaction of transactions) {
			if (!this.has(transaction.id())) {
				continue;
			}

			result[transaction.id()] = transaction;
		}

		this.#transactions = result;
	}
}
