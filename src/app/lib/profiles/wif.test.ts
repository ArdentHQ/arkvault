import { describe, it, expect, vi, beforeEach } from "vitest";
import { WalletImportFormat } from "./wif";

describe("WalletImportFormat", () => {
	const mockData = new Map<string, any>();

	const mockWallet = {
		data: () => ({
			get: (key: string) => mockData.get(key),
			has: (key: string) => mockData.has(key),
			forget: (key: string) => mockData.delete(key),
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
});
