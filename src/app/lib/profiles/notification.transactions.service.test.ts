import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ProfileTransactionNotificationService } from "./notification.transactions.service";
import { NotificationRepository } from "./notification.repository";
import { INotificationTypes } from "./notification.repository.contract";
import { IProfile } from "./contracts";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const mockTransaction = (hash: string, overrides: Record<string, any> = {}) => ({
	confirmations: () => ({ isGreaterThan: () => false }),
	hash: () => hash,
	isSuccess: () => true,
	recipients: () => [],
	timestamp: () => ({ toUNIX: () => 1000 }),
	to: () => "address1",
	type: () => "transfer",
	wallet: () => ({ networkId: () => "network1" }),
	...overrides,
});

describe("ProfileTransactionNotificationService", () => {
	let profile: IProfile;
	let service: ProfileTransactionNotificationService;
	let notificationRepository: NotificationRepository;

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		vi.spyOn(profile.wallets(), "values").mockReturnValue([]);
		vi.spyOn(profile.status(), "markAsDirty").mockReturnValue(undefined);

		notificationRepository = new NotificationRepository(profile);
		vi.spyOn(notificationRepository, "markAsRead");
		vi.spyOn(notificationRepository, "markAsRemoved");

		service = new ProfileTransactionNotificationService(profile, notificationRepository);
	});

	afterEach(() => {
		vi.restoreAllMocks();
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

		vi.spyOn(profile, "transactionAggregate").mockImplementation(
			() =>
				({
					all: vi.fn().mockImplementation(async () => {
						syncingDuringSync = service.isSyncing();
						return { items: () => [] };
					}),
					flush: vi.fn(),
				}) as any,
		);

		vi.spyOn(profile, "wallets").mockImplementation(
			() =>
				({
					selected: () => [],
					values: () => [],
				}) as any,
		);

		await service.sync();

		expect(syncingDuringSync).toBe(true);
		expect(service.isSyncing()).toBe(false);
	});

	it("should not hydrate when cache is empty", async () => {
		await service.hydrateFromCache();
		expect(service.transactions()).toEqual([]);
	});

	const setupForSync = () => {
		const wallet = profile.wallets().first();

		vi.spyOn(profile, "wallets").mockImplementation(
			() =>
				({
					findByAddressWithNetwork: vi.fn().mockReturnValue(true),
					selected: () => [wallet],
					values: () => [wallet],
				}) as any,
		);

		vi.spyOn(profile, "transactionAggregate").mockImplementation(
			() =>
				({
					all: vi.fn().mockResolvedValue({ items: () => [] }),
					flush: vi.fn(),
				}) as any,
		);
	};

	describe("#active", () => {
		it("should return synced transactions", async () => {
			setupForSync();
			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({ items: () => [mockTransaction("tx-1")] }),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			const result = service.active();
			expect(result).toHaveLength(1);
			expect(result[0].hash()).toBe("tx-1");
		});

		it("should not push duplicate notifications for seen transactions", async () => {
			setupForSync();

			notificationRepository.push({
				meta: { transactionId: "tx-seen" },
				type: INotificationTypes.Transaction,
			});

			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({ items: () => [mockTransaction("tx-seen")] }),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			expect(notificationRepository.values()).toHaveLength(1);
		});

		it("should skip not allowed transaction types", async () => {
			setupForSync();
			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [mockTransaction("tx-vote", { type: () => "vote" })],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			expect(service.active()).toEqual([]);
		});

		it("should skip transactions where user is not a recipient", async () => {
			setupForSync();
			vi.spyOn(profile, "wallets").mockImplementation(
				() =>
					({
						findByAddressWithNetwork: vi.fn().mockReturnValue(false),
						selected: () => [],
						values: () => [],
					}) as any,
			);
			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [mockTransaction("tx-other")],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			expect(service.active()).toEqual([]);
		});

		it("should return empty when no transactions are synced", async () => {
			setupForSync();

			await service.sync();

			expect(service.active()).toEqual([]);
		});

		it("should skip removed notifications in filterUnseen", async () => {
			setupForSync();

			notificationRepository.push({
				isRemoved: true,
				meta: { transactionId: "tx-removed" },
				type: INotificationTypes.Transaction,
			});

			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [mockTransaction("tx-removed")],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			expect(service.active()).toEqual([]);
		});

		it("should include unsuccessful transactions with confirmations", async () => {
			setupForSync();
			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [
								mockTransaction("tx-failed", {
									confirmations: () => ({ isGreaterThan: () => true }),
									isSuccess: () => false,
								}),
							],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			const result = service.active();
			expect(result).toHaveLength(1);
			expect(result[0].hash()).toBe("tx-failed");
		});
	});

	describe("#markAsRead and #markAsRemoved edge cases", () => {
		it("should do nothing when non-existent notification is marked as read", () => {
			expect(() => service.markAsRead("non-existent")).not.toThrow();
		});

		it("should do nothing when marking non-existent notification as removed", () => {
			expect(() => service.markAsRemoved("non-existent")).not.toThrow();
		});
	});

	describe("#hydrateFromCache with data", () => {
		it("should hydrate transactions from cache", async () => {
			setupForSync();

			notificationRepository.push({
				meta: { transactionId: "tx-cached" },
				type: INotificationTypes.Transaction,
			});

			await service.hydrateFromCache();

			expect(service.transactions()).toEqual([]);
		});

		it("should store transactions from cache when cache has data", async () => {
			setupForSync();

			const mockTx = mockTransaction("tx-from-cache");

			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [mockTx],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			await service.hydrateFromCache();

			expect(service.transactions()).toHaveLength(1);
			expect(service.transactions()[0].hash()).toBe("tx-from-cache");
		});
	});

	describe("#active with transactions that have no notification", () => {
		it("should return transactions that have no notification", async () => {
			setupForSync();
			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [
								mockTransaction("tx-no-notif", {
									recipients: () => [{ address: "address1" }],
								}),
							],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			const result = service.active();
			expect(result).toHaveLength(1);
			expect(result[0].hash()).toBe("tx-no-notif");
		});

		it("should include non-removed transactions with recipients", async () => {
			setupForSync();
			vi.spyOn(profile, "transactionAggregate").mockImplementation(
				() =>
					({
						all: vi.fn().mockResolvedValue({
							items: () => [
								mockTransaction("tx-with-recipients", {
									recipients: () => [{ address: "0xother" }],
								}),
							],
						}),
						flush: vi.fn(),
					}) as any,
			);

			await service.sync();

			const result = service.active();
			expect(result).toHaveLength(1);
		});
	});
});
