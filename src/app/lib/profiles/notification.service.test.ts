import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { expect } from "vitest";

describe("ProfileNotificationService", () => {
	test("#markAsRead", ({ profile }) => {
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		profile.notifications().fill({
			a: {
				body: "test",
				id: "a",
				read_at: undefined,
				type: "transaction",
			},
		});

		profile.notifications().markAsRead("a");

		const notification = profile.notifications().get("a");
		expect(notification.read_at).toBeDefined();
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("#markAsRemoved", ({ profile }) => {
		const statusSpy = vi.spyOn(profile.status(), "markAsDirty");

		profile.notifications().fill({
			a: {
				body: "test",
				id: "a",
				isRemoved: false,
				type: "transaction",
			},
		});

		profile.notifications().markAsRemoved("a");

		const notification = profile.notifications().get("a");
		expect(notification.isRemoved).toBe(true);
		expect(statusSpy).toHaveBeenCalled();
		statusSpy.mockRestore();
	});

	test("should return false when no unread notifications", ({ profile }) => {
		profile.notifications().fill({
			a: {
				body: "test",
				id: "a",
				read_at: Date.now(),
				type: "transaction",
			},
		});

		expect(profile.notifications().hasUnread()).toBe(false);
	});

	test("should return true when there are unread notifications", ({ profile }) => {
		profile.notifications().fill({
			a: {
				body: "test",
				id: "a",
				read_at: undefined,
				type: "transaction",
			},
		});

		expect(profile.notifications().hasUnread()).toBe(true);
	});
});
