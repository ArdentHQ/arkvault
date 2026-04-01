import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";
import { INotificationTypes } from "./notification.repository.contract.js";
import { NotificationRepository } from "./notification.repository.js";
import { env, getDefaultProfileId } from "@/utils/testing-library";

const notification = {
	body: "test",
	icon: undefined,
	id: "1",
	name: "test",
	read_at: new Date().getTime(),
	type: INotificationTypes.Transaction,
};

describe("Notifications", () => {
	test("should return all notifications", ({ profile }) => {
		expect(profile.notifications().all()).toBeDefined();
	});

	test("should return all transaction notifications", ({ profile }) => {
		expect(profile.notifications().transactions()).toBeDefined();
	});

	test("should return the count of the notifications", ({ profile }) => {
		expect(profile.notifications().count()).toBe(0);
	});

	test("should return by id", ({ profile }) => {
		profile.notifications().fill({
			a: notification,
		});

		expect(profile.notifications().get("a")).toBe(notification);
	});

	test("should filter by type", ({ profile }) => {
		profile.notifications().fill({
			a: notification,
		});

		expect(profile.notifications().filterByType(INotificationTypes.Transaction)).toEqual([notification]);
	});

	test("should return whether it has unread", ({ profile }) => {
		profile.notifications().fill({
			a: { ...notification, read_at: undefined },
		});

		expect(profile.notifications().hasUnread()).toEqual(true);
	});

	test("#keys", ({ profile }) => {
		profile.notifications().fill({
			a: notification,
		});

		expect(Object.keys(profile.notifications().all())).toEqual(["a"]);
	});

	test("#values", ({ profile }) => {
		profile.notifications().fill({
			a: notification,
		});

		expect(Object.values(profile.notifications().all())).toHaveLength(1);
	});

	test("#has", ({ profile }) => {
		profile.notifications().fill({
			a: notification,
		});

		expect(profile.notifications().all()["a"]).toBeDefined();
	});

	test("#get should throw if not found", ({ profile }) => {
		expect(() => profile.notifications().get("non-existent")).toThrow(
			"Failed to find a notification that matches [non-existent].",
		);
	});

	test("#markAsRead", ({ profile }) => {
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		profile.notifications().fill({
			a: { ...notification, read_at: undefined },
		});

		profile.notifications().markAsRead("a");

		const result = profile.notifications().get("a");
		expect(result.read_at).toBeDefined();
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#markAsRemoved", ({ profile }) => {
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		profile.notifications().fill({
			a: { ...notification, isRemoved: false },
		});

		profile.notifications().markAsRemoved("a");

		const result = profile.notifications().get("a");
		expect(result.isRemoved).toBe(true);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#findByTransactionId", ({ profile }) => {
		profile.notifications().fill({
			a: { ...notification, meta: { transactionId: "tx-123" } },
		});

		const result = profile.notifications().transactions().findByTransactionId("tx-123");
		expect(result).toBeDefined();
	});

	test("#flush", ({ profile }) => {
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		profile.notifications().fill({
			a: notification,
		});

		profile.notifications().flush();

		expect(profile.notifications().count()).toBe(0);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("should check if notification exists with has", ({ profile }) => {
		profile.notifications().fill({ a: notification });

		expect(profile.notifications().hasUnread()).toBe(false);
	});

	describe("NotificationRepository", () => {
		let profile: any;
		let repository: NotificationRepository;

		beforeEach(() => {
			profile = env.profiles().findById(getDefaultProfileId());
			vi.spyOn(profile.status(), "markAsDirty").mockReturnValue(undefined);
			repository = new NotificationRepository(profile);
		});

		test("#first", () => {
			repository.fill({
				a: { ...notification, id: "a" },
				b: { ...notification, id: "b" },
			});

			const first = repository.first();
			expect(first.id).toBe("a");
		});

		test("#last", () => {
			repository.fill({
				a: { ...notification, id: "a" },
				b: { ...notification, id: "b" },
			});

			const last = repository.last();
			expect(last.id).toBe("b");
		});

		test("#forget should throw if not found", () => {
			expect(() => repository.forget("non-existent")).toThrow(
				"Failed to find a notification that matches [non-existent].",
			);
		});

		test("#forget should remove notification", () => {
			repository.fill({
				a: notification,
			});

			repository.forget("a");

			expect(repository.count()).toBe(0);
		});

		test("#read should return only read notifications", () => {
			repository.fill({
				a: { ...notification, id: "a", read_at: new Date().getTime() },
				b: { ...notification, id: "b", read_at: undefined },
			});

			const read = repository.read();
			expect(read).toHaveLength(1);
			expect(read[0].id).toBe("a");
		});

		test("#unread should return only unread notifications", () => {
			repository.fill({
				a: { ...notification, id: "a", read_at: new Date().getTime() },
				b: { ...notification, id: "b", read_at: undefined },
			});

			const unread = repository.unread();
			expect(unread).toHaveLength(1);
			expect(unread[0].id).toBe("b");
		});

		test("#has should return true for existing key", () => {
			repository.fill({ a: notification });

			expect(repository.has("a")).toBe(true);
		});

		test("#has should return false for non-existing key", () => {
			expect(repository.has("non-existent")).toBe(false);
		});

		test("#keys should return all keys", () => {
			repository.fill({
				a: notification,
				b: { ...notification, id: "b" },
			});

			expect(repository.keys()).toEqual(["a", "b"]);
		});

		test("#values should return all values", () => {
			repository.fill({
				a: notification,
				b: { ...notification, id: "b" },
			});

			expect(repository.values()).toHaveLength(2);
		});

		test("#findByTransactionId should return undefined when not found", () => {
			repository.fill({
				a: { ...notification, meta: { transactionId: "tx-123" } },
			});

			const result = repository.findByTransactionId("tx-456");
			expect(result).toBeUndefined();
		});

		test("#push should create notification", () => {
			const result = repository.push({
				body: "test notification",
				type: INotificationTypes.Transaction,
			});

			expect(result.body).toBe("test notification");
			expect(result.meta).toBeDefined();
		});

		test("#markAsRead should throw if not found", () => {
			expect(() => repository.markAsRead("non-existent")).toThrow(
				"Failed to find a notification that matches [non-existent].",
			);
		});

		test("#markAsRemoved should throw if not found", () => {
			expect(() => repository.markAsRemoved("non-existent")).toThrow(
				"Failed to find a notification that matches [non-existent].",
			);
		});
	});
});
