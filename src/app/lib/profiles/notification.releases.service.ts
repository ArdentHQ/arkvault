import { INotification, INotificationTypes, IWalletReleaseNotificationService } from "./contracts.js";
import { INotificationRepository } from "./notification.repository.contract.js";

export class WalletReleaseNotificationService implements IWalletReleaseNotificationService {
	readonly #notifications: INotificationRepository;
	readonly #defaultLimit: number;

	public constructor(notificationRepository: INotificationRepository) {
		this.#defaultLimit = 10;
		this.#notifications = notificationRepository;
	}

	/** {@inheritDoc IWalletReleaseNotificationService.findByVersion} */
	public findByVersion(version: string) {
		return this.#notifications.findByVersion(version);
	}

	/** {@inheritDoc IWalletReleaseNotificationService.has} */
	public has(version: string) {
		return !!this.findByVersion(version);
	}

	/** {@inheritDoc IWalletReleaseNotificationService.push} */
	public push(notification: INotification) {
		if (!notification.meta?.version) {
			return;
		}

		if (this.has(notification.meta.version)) {
			return;
		}

		return this.#notifications.push({
			...notification,
			action: "update",
			read_at: undefined,
			type: INotificationTypes.Release,
		});
	}

	/** {@inheritDoc IWalletReleaseNotificationService.markAsRead} */
	public markAsRead(version: string) {
		const notification = this.findByVersion(version);

		if (!notification) {
			return;
		}

		this.#notifications.markAsRead(notification.id);
	}

	/** {@inheritDoc IWalletReleaseNotificationService.forget} */
	public forget(version: string) {
		const notification = this.findByVersion(version);

		if (!notification) {
			return;
		}

		return this.#notifications.forget(notification.id);
	}

	/** {@inheritDoc IWalletReleaseNotificationService.recent} */
	public recent(limit?: number) {
		return this.#notifications.filterByType(INotificationTypes.Release).slice(0, limit || this.#defaultLimit);
	}
}
