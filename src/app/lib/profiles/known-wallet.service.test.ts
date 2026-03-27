import { beforeEach, describe, it, expect, vi } from "vitest";
import { KnownWalletService } from "./known-wallet.service";

describe("KnownWalletService", () => {
	let service: KnownWalletService;
	const networkName = "mainsail.devnet";

	beforeEach(() => {
		service = new KnownWalletService();
	});

	describe("#sync", () => {
		it("should handle sync errors gracefully", async () => {
			const mockProfile = {} as any;
			const mockNetwork = {
				config: () => ({
					get: vi.fn().mockReturnValue("https://example.com/known-wallets.json"),
				}),
				id: () => networkName,
			} as any;

			await expect(service.sync(mockProfile, mockNetwork)).resolves.not.toThrow();
		});

		it("should handle network without known wallets config", async () => {
			const mockProfile = {} as any;
			const mockNetwork = {
				config: () => ({
					get: vi.fn().mockReturnValue(undefined),
				}),
				id: () => networkName,
			} as any;

			await expect(service.sync(mockProfile, mockNetwork)).resolves.not.toThrow();
		});
	});

	describe("#name", () => {
		it("should return undefined for unknown network", () => {
			expect(service.name("unknown.network", "wallet1")).toBeUndefined();
		});

		it("should return undefined when no wallets in registry", () => {
			expect(service.name(networkName, "wallet1")).toBeUndefined();
		});
	});

	describe("#is", () => {
		it("should return false for unknown network", () => {
			expect(service.is("unknown.network", "wallet1")).toBe(false);
		});

		it("should return false when no wallets exist", () => {
			expect(service.is(networkName, "wallet1")).toBe(false);
		});
	});

	describe("#isExchange", () => {
		it("should return false for unknown network", () => {
			expect(service.isExchange("unknown.network", "wallet1")).toBe(false);
		});

		it("should return false when no wallets exist", () => {
			expect(service.isExchange(networkName, "wallet1")).toBe(false);
		});
	});

	describe("#isTeam", () => {
		it("should return false for unknown network", () => {
			expect(service.isTeam("unknown.network", "wallet1")).toBe(false);
		});

		it("should return false when there are no wallets", () => {
			expect(service.isTeam(networkName, "wallet1")).toBe(false);
		});
	});
});
