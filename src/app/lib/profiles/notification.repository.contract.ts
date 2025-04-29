import { Except } from "type-fest";

import { AggregateQuery } from "./transaction.aggregate.contract.js";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";

/**
 * Defines the structure that represents the type of a notification
 *
 * @export
 * @interface INotificationType
 */
export enum INotificationTypes {
	Transaction = "transaction",
	Release = "release",
	Plugin = "plugin",
}

export type INotificationType = INotificationTypes.Transaction | INotificationTypes.Release | INotificationTypes.Plugin;

/**
 * Defines the structure that represents a notification.
 *
 * @export
 * @interface INotification
 */
export interface INotification {
	id: string;
	icon: string;
	name: string;
	body: string;
	type: string;
	action: string;
	read_at?: number;
	meta: Record<string, any>;
}

/**
 * Defines the structure that represents a transaction notification.
 *
 * @export
 * @interface INotification
 */
export interface ITransactionNotification {
	id: string;
	type: string;
	read_at?: number;
	meta: {
		timestamp?: number;
		transactionId: string;
		recipients?: string[];
	};
}

/**
 * Defines the implementation contract for the notification repository.
 *
 * @export
 * @interface INotificationRepository
 */
export interface INotificationRepository {
	/**
	 * Get all keys and values.
	 *
	 * @returns {Record<string, INotification>}
	 * @memberof INotificationRepository
	 */
	all(): Record<string, INotification>;

	/**
	 * Get the first notification.
	 *
	 * @returns {INotification}
	 * @memberof INotificationRepository
	 */
	first(): INotification;

	/**
	 * Get the last notification.
	 *
	 * @returns {INotification}
	 * @memberof INotificationRepository
	 */
	last(): INotification;

	/**
	 * Get all keys.
	 *
	 * @returns {string[]}
	 * @memberof INotificationRepository
	 */
	keys(): string[];

	/**
	 * Get all values.
	 *
	 * @returns {INotification[]}
	 * @memberof INotificationRepository
	 */
	values(): INotification[];

	/**
	 * Get a notification for the given key.
	 *
	 * @param {string} key
	 * @returns {INotification}
	 * @memberof INotificationRepository
	 */
	get(key: string): INotification;

	/**
	 * Create a new notification.
	 *
	 * @param {Partial<Except<INotification, "id">>} value
	 * @returns {INotification}
	 * @memberof INotificationRepository
	 */
	push(value: Partial<Except<INotification, "id">>): INotification;

	/**
	 * Fill the storage with notification data.
	 *
	 * @param {object} entries
	 * @memberof INotificationRepository
	 */
	fill(entries: object): void;

	/**
	 * Check if the given notification exists.
	 *
	 * @param {string} key
	 * @returns {boolean}
	 * @memberof INotificationRepository
	 */
	has(key: string): boolean;

	/**
	 * Remove the notification for the given ID.
	 *
	 * @param {string} key
	 * @memberof INotificationRepository
	 */
	forget(key: string): void;

	/**
	 * Remove all notifications.
	 *
	 * @memberof INotificationRepository
	 */
	flush(): void;

	/**
	 * Count how many notifications there are.
	 *
	 * @returns {number}
	 * @memberof INotificationRepository
	 */
	count(): number;

	/**
	 * Get all read notifications.
	 *
	 * @returns {INotification[]}
	 * @memberof INotificationRepository
	 */
	read(): INotification[];

	/**
	 * Get all unread notifications.
	 *
	 * @returns {INotification[]}
	 * @memberof INotificationRepository
	 */
	unread(): INotification[];

	/**
	 * Mark the given notification as read.
	 *
	 * @param {string} key
	 * @memberof INotificationRepository
	 */
	markAsRead(key: string): void;

	/**
	 * Filter notifications by type
	 *
	 * @param {INotificationType} type
	 * @memberof INotificationRepository
	 */
	filterByType(type: INotificationType): INotification[];

	/**
	 * Get notification by transaction id
	 *
	 * @param {string} transactionId
	 * @memberof INotificationRepository
	 */
	findByTransactionId(transactionId: string): INotification | undefined;

	/**
	 * Get notification by version
	 *
	 * @param {string} transactionId
	 * @memberof INotificationRepository
	 */
	findByVersion(version: string): INotification | undefined;
}

/**
 * Defines the implementation contract for the profile transaction notification service.
 *
 * @export
 * @interface IProfileTransactionNotificationService
 */
export interface IProfileTransactionNotificationService {
	/**
	 * Fetch recent transactions
	 *
	 * @param {AggregateQuery} query
	 * @memberof IProfileTransactionNotificationService
	 */
	sync(query?: AggregateQuery): Promise<void>;

	/**
	 * Check if the given transaction notification exists.
	 *
	 * @param {string} transactionId
	 * @memberof IProfileTransactionNotificationService
	 */
	has(transactionId: string): Boolean;

	/**
	 * Forget transaction notification
	 *
	 * @param {string} transactionId
	 * @memberof IProfileTransactionNotificationService
	 */
	forget(transactionId: string): void;

	/**
	 * Forget transaction notifications that have the given wallet address as recipient
	 *
	 * @param {string} address
	 * @memberof IProfileTransactionNotificationService
	 */
	forgetByRecipient(address: string): void;

	/**
	 * Get the most recent transaction notifications
	 *
	 * @param {number} limit
	 * @memberof IProfileTransactionNotificationService
	 */
	recent(limit?: number): INotification[];

	/**
	 * Mark the given transaction notification as read.
	 *
	 * @param {string} transactionId
	 * @memberof IProfileTransactionNotificationService
	 */
	markAsRead(key: string): void;

	/**
	 * Get notification by transaction id
	 *
	 * @param {string} transactionId
	 * @memberof IProfileTransactionNotificationService
	 */
	findByTransactionId(transactionId: string): INotification | undefined;

	/**
	 * Get stored transactions
	 *
	 * @param {string} limit
	 * @memberof IProfileTransactionNotificationService
	 */
	transactions(limit?: number): ExtendedConfirmedTransactionData[];

	/**
	 * Get stored transaction by id
	 *
	 * @param {string} transactionId
	 * @memberof IProfileTransactionNotificationService
	 */
	transaction(transactionId: string): ExtendedConfirmedTransactionData | undefined;

	/**
	 * Check if the notification transactions are syncing
	 *
	 * @memberof IProfileTransactionNotificationService
	 */
	isSyncing(): boolean;

	/**
	 * Mark all notifications as read
	 *
	 * @memberof IProfileTransactionNotificationService
	 */
	markAllAsRead(): void;
}

/**
 * Defines the implementation contract for the updates notification service.
 *
 * @export
 * @interface IProfileUpdateNotifications
 */
export interface IWalletReleaseNotificationService {
	/**
	 * Mark the given version as read.
	 *
	 * @param {string} version
	 * @memberof IWalletReleaseNotificationService
	 */
	markAsRead(key: string): void;

	/**
	 * Get notification by version
	 *
	 * @param {string} version
	 * @memberof IWalletReleaseNotificationService
	 */
	findByVersion(version: string): INotification | undefined;

	/**
	 * Check if notification for the given version exists.
	 *
	 * @param {string} version
	 * @returns {boolean}
	 * @memberof IWalletReleaseNotificationService
	 */
	has(version: string): boolean;

	/**
	 * Push a a new version release notification
	 *
	 * @param {Partial<Except<INotification, "id">>} value
	 * @returns {INotification}
	 * @memberof IWalletReleaseNotificationService
	 */
	push(notification: Partial<Except<INotification, "id">>): INotification | undefined;

	/**
	 * Remove the notification for the given version.
	 *
	 * @param {string} version
	 * @memberof IWalletReleaseNotificationService
	 */
	forget(version: string): void;

	/**
	 * Get the most recent transaction notifications
	 *
	 * @param {number} limit
	 * @memberof IWalletReleaseNotificationService
	 */
	recent(limit?: number): INotification[];
}

/**
 * Defines the implementation contract for the profile notification service.
 *
 * @export
 * @interface IProfileNotificationService
 */
export interface IProfileNotificationService {
	/**
	 * Get the transaction notification service
	 *
	 * @memberof IProfileNotificationService
	 */
	transactions(): IProfileTransactionNotificationService;

	/**
	 * Get the wallet releases notification service
	 *
	 * @memberof IProfileNotificationService
	 */
	releases(): IWalletReleaseNotificationService;

	/**
	 * Mark the given notification as read.
	 *
	 * @param {string} id
	 * @memberof IProfileNotificationService
	 */
	markAsRead(id: string): void;

	/**
	 * Get a notification for the given key.
	 *
	 * @param {string} id
	 * @returns {INotification}
	 * @memberof IProfileNotificationService
	 */
	get(id: string): INotification;

	/**
	 * Count how many notifications there are.
	 *
	 * @returns {number}
	 * @memberof IProfileNotificationService
	 */
	count(): number;

	/**
	 * Filter notifications by type
	 *
	 * @param {INotificationType} type
	 * @memberof IProfileNotificationService
	 */
	filterByType(type: INotificationType): INotification[];

	/**
	 * Get all notifications.
	 *
	 * @returns {Record<string, INotification>}
	 * @memberof IProfileNotificationService
	 */
	all(): Record<string, INotification>;

	/**
	 * Remove all notifications.
	 *
	 * @memberof IProfileNotificationService
	 */
	flush(): void;

	/**
	 * Fill the storage with notification data.
	 *
	 * @param {object} entries
	 * @memberof IProfileNotificationService
	 */
	fill(entries: object): void;

	/**
	 * Check if profile has unread notifications
	 *
	 * @memberof IProfileNotificationService
	 */
	hasUnread(): boolean;
}
