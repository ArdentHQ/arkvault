import { test } from "@/utils/testing-library";
import { expect } from "vitest";

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

	test("should return first", ({ profile }) => {
		const notification = {
			body: "test",
			icon: undefined,
			id: "1",
			name: "test",
			read_at: new Date().getTime(),
			type: "transaction",
		};

		profile.notifications().fill({
			a: notification,
		});
	});
	test("should return by id", ({ profile }) => {
		const notification = {
			body: "test",
			icon: undefined,
			id: "1",
			name: "test",
			read_at: new Date().getTime(),
			type: "transaction",
		};

		profile.notifications().fill({
			a: notification,
		});

		expect(profile.notifications().get("a")).toBe(notification);
	});

	test("should filter by type", ({ profile }) => {
		const notification = {
			body: "test",
			icon: undefined,
			id: "1",
			name: "test",
			read_at: new Date().getTime(),
			type: "transaction",
		};

		profile.notifications().fill({
			a: notification,
		});

		expect(profile.notifications().filterByType("transaction")).toEqual([notification]);
	});

	test("should return whether it has unread", ({ profile }) => {
		const notification = {
			body: "test",
			icon: undefined,
			id: "1",
			name: "test",
			read_at: undefined,
			type: "transaction",
		};

		profile.notifications().fill({
			a: notification,
		});

		expect(profile.notifications().hasUnread()).toEqual(true);
	});
});
