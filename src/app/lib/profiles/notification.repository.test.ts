import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";
import { INotificationTypes } from "./notification.repository.contract.js";

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

	test("should return first notification", ({ profile }) => {
		profile.notifications().fill({
			a: { ...notification, id: "a" },
			b: { ...notification, id: "b" },
		});

		expect(profile.notifications().first()).toBeDefined();
	});

	test("should return last notification", ({ profile }) => {
		profile.notifications().fill({
			a: { ...notification, id: "a" },
			b: { ...notification, id: "b" },
		});

		expect(profile.notifications().last()).toBeDefined();
	});

	test("should check if notification exists", ({ profile }) => {
		profile.notifications().fill({ a: notification });

		expect(profile.notifications().has("a")).toBe(true);
		expect(profile.notifications().has("nonexistent")).toBe(false);
	});
});
