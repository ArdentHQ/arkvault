import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletImportFormat } from "./wif";

const legacyMnemonic = "canyon tip home amazing sword capital pupil gadget rebel glance grain suggest";
const legacyEncryptedKey =
	"U2FsdGVkX1/tN/OUpYfqwYHjBfAgO2On7rqUSyGpt61vUezpQv/j4CPvYDOjkcssFOoC82U9FlBt7BtiMf7t0Wt/EGvhuJ2eTDwJ79PDuZ0KRSqBSJ2Gnjm7fb1sSWHK";

describe("WalletImportFormat", () => {
	const mockData = new Map<string, any>();

	const mockWallet = {
		data: () => ({
			forget: (key: string) => mockData.delete(key),
			get: (key: string) => mockData.get(key),
			has: (key: string) => mockData.has(key),
			set: (key: string, value: any) => mockData.set(key, value),
		}),
		profile: () => ({
			status: () => ({
				markAsDirty: vi.fn(),
			}),
		}),
	};

	beforeEach(() => {
		mockData.clear();
	});

	it("should throw when getting key that does not exist", async () => {
		const wif = new WalletImportFormat(mockWallet as any, "wif");
		await expect(wif.get("password")).rejects.toThrow("This wallet does not use PBKDF2 encryption.");
	});

	it("should throw when forgetting key that does not exist", () => {
		const wif = new WalletImportFormat(mockWallet as any, "wif");
		expect(() => wif.forget()).toThrow("This wallet does not use PBKDF2 encryption.");
	});

	it("should return false for exists when key is not set", () => {
		const wif = new WalletImportFormat(mockWallet as any, "wif");
		expect(wif.exists()).toBe(false);
	});

	it("should return true for exists when key is set", () => {
		mockData.set("wif", "encrypted-value");
		const wif = new WalletImportFormat(mockWallet as any, "wif");
		expect(wif.exists()).toBe(true);
	});

	it("should decrypt a key encrypted with the current format", async () => {
		const wif = new WalletImportFormat(mockWallet as any, "wif");
		await wif.set("secret", "password");

		await expect(wif.get("password")).resolves.toBe("secret");
	});

	it("should decrypt a key encrypted with the legacy format", async () => {
		mockData.set("wif", legacyEncryptedKey);
		const wif = new WalletImportFormat(mockWallet as any, "wif");

		await expect(wif.get("password")).resolves.toBe(legacyMnemonic);
	});

	it("should fail to decrypt a legacy key with a wrong password", async () => {
		mockData.set("wif", legacyEncryptedKey);
		const wif = new WalletImportFormat(mockWallet as any, "wif");

		await expect(wif.get("wrong")).rejects.toThrow();
	});
});
