import { IProfile } from "./contracts.js";
import { NotificationRepository } from "./notification.repository";
import {
	INotificationRepository,
	INotificationType,
	IProfileNotificationService,
	IProfileTransactionNotificationService,
} from "./notification.repository.contract.js";
import { ProfileTransactionNotificationService } from "./notification.transactions.service.js";

export class ProfileNotificationService implements IProfileNotificationService {
	readonly #transactions: IProfileTransactionNotificationService;
	readonly #notificationRepository: INotificationRepository;

	public constructor(profile: IProfile) {
		this.#notificationRepository = new NotificationRepository(profile);
		this.#transactions = new ProfileTransactionNotificationService(profile, this.#notificationRepository);
	}

	/** {@inheritDoc IProfileNotificationService.all} */
	public all() {
		return this.#notificationRepository.all();
	}

	/** {@inheritDoc IProfileNotificationService.get} */
	public get(id: string) {
		return this.#notificationRepository.get(id);
	}

	/** {@inheritDoc IProfileNotificationService.hasUnread} */
	public hasUnread(): boolean {
		return this.#notificationRepository.unread().length > 0;
	}

	/** {@inheritDoc IProfileNotificationService.flush} */
	public flush() {
		return this.#notificationRepository.flush();
	}

	/** {@inheritDoc IProfileNotificationService.filll} */
	public fill(entries: object) {
		return this.#notificationRepository.fill(entries);
	}

	/** {@inheritDoc IProfileNotificationService.count} */
	public count() {
		return this.#notificationRepository.count();
	}

	/** {@inheritDoc IProfileNotificationService.markAsRead} */
	public markAsRead(id: string): void {
		return this.#notificationRepository.markAsRead(id);
	}

	/** {@inheritDoc IProfileNotificationService.transactions} */
	public transactions(): IProfileTransactionNotificationService {
		return this.#transactions;
	}

	/** {@inheritDoc IProfileNotificationService.filterByType} */
	public filterByType(type: INotificationType) {
		return this.#notificationRepository.filterByType(type);
	}
}
