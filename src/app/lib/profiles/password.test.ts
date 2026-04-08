import { describe, it, expect } from "vitest";
import { PasswordManager } from "./password";

describe("PasswordManager", () => {
	it("should throw when getting password before setting it", () => {
		const manager = new PasswordManager();
		expect(() => manager.get()).toThrow("Failed to find a password for the given profile.");
	});

	it("should set and get password", () => {
		const manager = new PasswordManager();
		manager.set("my-password");
		expect(manager.get()).toBe("my-password");
	});

	it("should check if password exists", () => {
		const manager = new PasswordManager();
		expect(manager.exists()).toBe(false);
		manager.set("my-password");
		expect(manager.exists()).toBe(true);
	});

	it("should forget password", () => {
		const manager = new PasswordManager();
		manager.set("my-password");
		manager.forget();
		expect(manager.exists()).toBe(false);
	});
});
