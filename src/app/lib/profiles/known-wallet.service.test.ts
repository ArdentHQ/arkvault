import { beforeEach, describe, it, expect, vi } from "vitest";
import { KnownWalletService } from "./known-wallet.service";
import { Http } from "@/app/lib/mainsail";

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

		it("should store known wallets on successful sync", async () => {
			const mockProfile = {} as any;
			const mockNetwork = {
				config: () => ({
					get: vi.fn().mockReturnValue("https://example.com/known-wallets.json"),
				}),
				id: () => networkName,
			} as any;

			vi.spyOn(Http.HttpClient.prototype, "get").mockResolvedValue({
				json: () => [
					{ address: "0x1", name: "Known Wallet 1", type: "team" },
					{ address: "0x2", name: "Known Wallet 2", type: "exchange" },
				],
			});

			await service.sync(mockProfile, mockNetwork);

			expect(service.name(networkName, "0x1")).toBe("Known Wallet 1");
			expect(service.is(networkName, "0x1")).toBe(true);
			expect(service.isTeam(networkName, "0x1")).toBe(true);
			expect(service.isExchange(networkName, "0x2")).toBe(true);
			expect(service.is(networkName, "0x10")).toBe(false);

			vi.restoreAllMocks();
		});

		it("should not store when response is not an array", async () => {
			const mockProfile = {} as any;
			const mockNetwork = {
				config: () => ({
					get: vi.fn().mockReturnValue("https://example.com/known-wallets.json"),
				}),
				id: () => networkName,
			} as any;

			vi.spyOn(Http.HttpClient.prototype, "get").mockResolvedValue({
				json: () => ({ error: "not found" }),
			});

			await service.sync(mockProfile, mockNetwork);

			expect(service.is(networkName, "0xWallet1")).toBe(false);

			vi.restoreAllMocks();
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
