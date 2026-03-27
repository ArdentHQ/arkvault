import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProfileTransactionNotificationService } from "./notification.transactions.service";
import { NotificationRepository } from "./notification.repository";
import { INotificationTypes } from "./notification.repository.contract";

describe("ProfileTransactionNotificationService", () => {
	let service: ProfileTransactionNotificationService;
	let notificationRepository: NotificationRepository;
	let mockProfile;
	let markAsDirtySpy;

	beforeEach(() => {
		markAsDirtySpy = vi.fn();
		mockProfile = {
			id: () => "test-profile",
			status: () => ({ markAsDirty: markAsDirtySpy }),
			wallets: () => ({
				values: () => [],
			}),
		};

		notificationRepository = new NotificationRepository(mockProfile);
		vi.spyOn(notificationRepository, "markAsRead");
		vi.spyOn(notificationRepository, "markAsRemoved");

		service = new ProfileTransactionNotificationService(mockProfile, notificationRepository);
	});

	it("should return notification from repository", () => {
		const notification = notificationRepository.push({
			meta: { transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		expect(service.findByTransactionId("tx-123")).toMatchObject({
			id: notification.id,
			meta: { transactionId: "tx-123" },
		});
	});

	it("should return true when notification exists", () => {
		notificationRepository.push({
			meta: { transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		expect(service.has("tx-123")).toBe(true);
	});

	it("should return false when notification does not exist", () => {
		expect(service.has("tx-123")).toBe(false);
	});

	it("should forget notification by transaction id", () => {
		notificationRepository.push({
			meta: { transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		service.forget("tx-123");

		expect(notificationRepository.values()).toHaveLength(0);
	});

	it("should forget notifications by recipient address", () => {
		notificationRepository.push({
			meta: { recipients: new Set(["address1"]), transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		service.forgetByRecipient("address1");

		expect(notificationRepository.values()).toHaveLength(0);
	});

	it("should not forget notifications with different recipient", () => {
		notificationRepository.push({
			meta: { recipients: new Set(["address2"]), transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		service.forgetByRecipient("address1");

		expect(notificationRepository.values()).toHaveLength(1);
	});

	it("should return recent notifications", () => {
		notificationRepository.push({
			meta: { timestamp: new Date().getTime() },
			type: INotificationTypes.Transaction,
		});
		notificationRepository.push({
			meta: { timestamp: new Date().getTime() },
			type: INotificationTypes.Transaction,
		});

		const result = service.recent();
		expect(result).toHaveLength(2);
	});

	it("should respect limit", () => {
		notificationRepository.push({
			meta: { timestamp: new Date().getTime() },
			type: INotificationTypes.Transaction,
		});
		notificationRepository.push({
			meta: { timestamp: new Date().getTime() },
			type: INotificationTypes.Transaction,
		});
		notificationRepository.push({
			meta: { timestamp: new Date().getTime() },
			type: INotificationTypes.Transaction,
		});

		const result = service.recent(2);
		expect(result).toHaveLength(2);
	});

	it("should mark notification as read", () => {
		const notification = notificationRepository.push({
			meta: { transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		service.markAsRead("tx-123");

		expect(notificationRepository.markAsRead).toHaveBeenCalledWith(notification.id);
	});

	it("should mark notification as removed", () => {
		const notification = notificationRepository.push({
			meta: { transactionId: "tx-123" },
			type: INotificationTypes.Transaction,
		});

		service.markAsRemoved("tx-123");

		expect(notificationRepository.markAsRemoved).toHaveBeenCalledWith(notification.id);
	});

	it("should mark all transaction notifications as read", () => {
		const transactionNotif = notificationRepository.push({
			type: INotificationTypes.Transaction,
		});

		service.markAllAsRead();

		expect(notificationRepository.get(transactionNotif.id).read_at).toBeDefined();
	});

	it("should mark all transaction notifications as removed", () => {
		const transactionNotif = notificationRepository.push({
			type: INotificationTypes.Transaction,
		});

		service.markAllAsRemoved();

		expect(notificationRepository.get(transactionNotif.id).isRemoved).toBe(true);
	});

	it("should return empty when no transactions", () => {
		expect(service.transactions()).toEqual([]);
	});

	it("should return undefined when transaction is not found", () => {
		expect(service.transaction("tx-123")).toBeUndefined();
	});

	it("should return false initially", () => {
		expect(service.isSyncing()).toBe(false);
	});

	it("should return true during sync", async () => {
		let syncingDuringSync = false;

		mockProfile.transactionAggregate = () => ({
			flush: vi.fn(),
			all: vi.fn().mockImplementation(async () => {
				syncingDuringSync = service.isSyncing();
				return { items: () => [] };
			}),
		});

		mockProfile.wallets = () => ({
			selected: () => [],
			values: () => [],
		});

		await service.sync();

		expect(syncingDuringSync).toBe(true);
		expect(service.isSyncing()).toBe(false);
	});

	it("should not hydrate when cache is empty", async () => {
		await service.hydrateFromCache();
		expect(service.transactions()).toEqual([]);
	});

	describe("#active", () => {
		const mockTransaction = (hash: string, overrides: Record<string, any> = {}) => ({
			hash: () => hash,
			to: () => "address1",
			recipients: () => [],
			timestamp: () => ({ toUNIX: () => 1000 }),
			type: () => "transfer",
			isSuccess: () => true,
			confirmations: () => ({ isGreaterThan: () => false }),
			wallet: () => ({ networkId: () => "network1" }),
			...overrides,
		});

		const setupForSync = () => {
			const mockWallet = {
				address: () => "address1",
				network: () => ({ id: () => "network1" }),
			};

			mockProfile.wallets = () => ({
				findByAddressWithNetwork: vi.fn().mockReturnValue(true),
				selected: () => [mockWallet],
				values: () => [mockWallet],
			});

			mockProfile.transactionAggregate = () => ({
				flush: vi.fn(),
				all: vi.fn().mockResolvedValue({ items: () => [] }),
			});
		};

		it("should return synced transactions", async () => {
			setupForSync();
			mockProfile.transactionAggregate = () => ({
				flush: vi.fn(),
				all: vi.fn().mockResolvedValue({ items: () => [mockTransaction("tx-1")] }),
			});

			await service.sync();

			const result = service.active();
			expect(result).toHaveLength(1);
			expect(result[0].hash()).toBe("tx-1");
		});

		it("should not push duplicate notifications for seen transactions", async () => {
			setupForSync();

			notificationRepository.push({
				type: INotificationTypes.Transaction,
				meta: { transactionId: "tx-seen" },
			});

			mockProfile.transactionAggregate = () => ({
				flush: vi.fn(),
				all: vi.fn().mockResolvedValue({ items: () => [mockTransaction("tx-seen")] }),
			});

			await service.sync();

			expect(notificationRepository.values()).toHaveLength(1);
		});

		it("should skip not allowed transaction types", async () => {
			setupForSync();
			mockProfile.transactionAggregate = () => ({
				flush: vi.fn(),
				all: vi.fn().mockResolvedValue({
					items: () => [mockTransaction("tx-vote", { type: () => "vote" })],
				}),
			});

			await service.sync();

			expect(service.active()).toEqual([]);
		});

		it("should skip transactions where user is not a recipient", async () => {
			setupForSync();
			mockProfile.wallets = () => ({
				findByAddressWithNetwork: vi.fn().mockReturnValue(false),
				selected: () => [],
				values: () => [],
			});
			mockProfile.transactionAggregate = () => ({
				flush: vi.fn(),
				all: vi.fn().mockResolvedValue({
					items: () => [mockTransaction("tx-other")],
				}),
			});

			await service.sync();

			expect(service.active()).toEqual([]);
		});

		it("should return empty when no transactions are synced", async () => {
			setupForSync();

			await service.sync();

			expect(service.active()).toEqual([]);
		});
	});
});
