import { test } from "@/utils/testing-library";
import { describe, expect } from "vitest";
import { Authenticator } from "./authenticator";

describe("Authenticator", () => {
	test("should set password and verify it successfully", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		const password = "mySecretPassword";

		authenticator.setPassword(password);

		expect(authenticator.verifyPassword(password)).toBe(true);
	});

	test("should return false for an incorrect password during verification", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		authenticator.setPassword("correctPassword");

		expect(authenticator.verifyPassword("incorrectPassword")).toBe(false);
	});

	test("should successfully forget the password", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		const passwordToForget = "initialPassword";
		authenticator.setPassword(passwordToForget);

		expect(authenticator.verifyPassword(passwordToForget)).toBe(true);

		authenticator.forgetPassword(passwordToForget);

		expect(profile.usesPassword()).toBe(false);
	});

	test("should throw an error when verifying a password if no password is set", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		expect(() => authenticator.verifyPassword("somePassword")).toThrow("No password is set.");
	});

	test("should throw an error when forgetting password with an incorrect current password", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		authenticator.setPassword("correctOldPassword");

		await expect(() => authenticator.forgetPassword("wrongPassword")).toThrow(
			"The current password does not match.",
		);

		expect(authenticator.verifyPassword("correctOldPassword")).toBe(true);
	});

	// Test case for changing a password
	test("should successfully change the password", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		const oldPassword = "oldSecretPassword";
		const newPassword = "newSuperSecretPassword";

		// Set an initial password
		authenticator.setPassword(oldPassword);
		expect(authenticator.verifyPassword(oldPassword)).toBe(true);

		// Change the password
		authenticator.changePassword(oldPassword, newPassword);

		expect(authenticator.verifyPassword("some password")).toBe(false);
		expect(authenticator.verifyPassword(newPassword)).toBe(true);
	});

	test("should throw an error when changing password with an incorrect old password", async ({ profile }) => {
		const authenticator = new Authenticator(profile);
		authenticator.setPassword("correctCurrentPassword");

		await expect(() => authenticator.changePassword("wrongOldPassword", "newPassword")).toThrow(
			"The current password does not match.",
		);
		expect(authenticator.verifyPassword("correctCurrentPassword")).toBe(true);
	});
});
