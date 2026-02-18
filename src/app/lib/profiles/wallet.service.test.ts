import { describe, expect, it, beforeEach, vi } from "vitest";
import { WalletService } from "./wallet.service";
import { IProfile } from "./contracts";
import { env, getMainsailProfileId } from "@/utils/testing-library";

describe("WalletService", () => {
	let walletService: WalletService;
	let profile: IProfile;

	beforeEach(() => {
		vi.clearAllMocks();
		walletService = new WalletService();
		profile = env.profiles().findById(getMainsailProfileId());
	});

	describe("syncByProfile", () => {
		it("should sync all wallets for enabled networks", async () => {
			// Mock available networks
			const mockNetwork = {
				id: () => "test-network",
				meta: () => ({ enabled: true }),
			};
			const availableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue([mockNetwork as any]);

			// Mock synchroniser methods
			const identityFn = vi.fn().mockResolvedValue(undefined);
			const votesFn = vi.fn().mockResolvedValue(undefined);

			// Mock wallets
			const mockWallet = {
				networkId: () => "test-network",
				synchroniser: () => ({
					identity: identityFn,
					votes: votesFn,
				}),
			};
			const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([mockWallet as any]);

			// Mock pqueueSettled to actually execute the functions
			const pqueueSpy = vi
				.spyOn(await import("./helpers/queue"), "pqueueSettled")
				.mockImplementation(async (promises: (() => Promise<any>)[]) => {
					// Execute all promises to cover lines 27-28
					for (const promiseFn of promises) {
						await promiseFn();
					}
				});

			await walletService.syncByProfile(profile);

			expect(availableNetworksSpy).toHaveBeenCalled();
			expect(walletsSpy).toHaveBeenCalled();
			expect(pqueueSpy).toHaveBeenCalledWith(expect.any(Array));
			expect(identityFn).toHaveBeenCalled();
			expect(votesFn).toHaveBeenCalled();

			availableNetworksSpy.mockRestore();
			walletsSpy.mockRestore();
			pqueueSpy.mockRestore();
		});

		it("should sync only specified networks when networkIds provided", async () => {
			// Mock available networks
			const mockNetwork1 = {
				id: () => "network-1",
				meta: () => ({ enabled: true }),
			};
			const mockNetwork2 = {
				id: () => "network-2",
				meta: () => ({ enabled: true }),
			};
			const availableNetworksSpy = vi
				.spyOn(profile, "availableNetworks")
				.mockReturnValue([mockNetwork1, mockNetwork2] as any);

			// Mock wallets - only one should match the specified network
			const mockWallet = {
				networkId: () => "network-1",
				synchroniser: () => ({
					identity: vi.fn().mockResolvedValue(undefined),
					votes: vi.fn().mockResolvedValue(undefined),
				}),
			};
			const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([mockWallet as any]);

			// Mock pqueueSettled
			const pqueueSpy = vi.spyOn(await import("./helpers/queue"), "pqueueSettled").mockResolvedValue(undefined);

			await walletService.syncByProfile(profile, ["network-1"]);

			expect(availableNetworksSpy).toHaveBeenCalled();
			expect(walletsSpy).toHaveBeenCalled();
			expect(pqueueSpy).toHaveBeenCalledWith(expect.any(Array));

			availableNetworksSpy.mockRestore();
			walletsSpy.mockRestore();
			pqueueSpy.mockRestore();
		});

		it("should skip disabled networks", async () => {
			// Mock available networks with one disabled
			const mockNetwork1 = {
				id: () => "enabled-network",
				meta: () => ({ enabled: true }),
			};
			const mockNetwork2 = {
				id: () => "disabled-network",
				meta: () => ({ enabled: false }),
			};
			const availableNetworksSpy = vi
				.spyOn(profile, "availableNetworks")
				.mockReturnValue([mockNetwork1, mockNetwork2] as any);

			// Mock wallets for both networks
			const mockWallet1 = {
				networkId: () => "enabled-network",
				synchroniser: () => ({
					identity: vi.fn().mockResolvedValue(undefined),
					votes: vi.fn().mockResolvedValue(undefined),
				}),
			};
			const mockWallet2 = {
				networkId: () => "disabled-network",
				synchroniser: () => ({
					identity: vi.fn().mockResolvedValue(undefined),
					votes: vi.fn().mockResolvedValue(undefined),
				}),
			};
			const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([mockWallet1, mockWallet2] as any);

			// Mock pqueueSettled
			const pqueueSpy = vi.spyOn(await import("./helpers/queue"), "pqueueSettled").mockResolvedValue(undefined);

			await walletService.syncByProfile(profile);

			expect(availableNetworksSpy).toHaveBeenCalled();
			expect(walletsSpy).toHaveBeenCalled();
			// Should only sync promises for enabled network wallet
			expect(pqueueSpy).toHaveBeenCalledWith(
				expect.arrayContaining([expect.any(Function), expect.any(Function)]),
			);

			availableNetworksSpy.mockRestore();
			walletsSpy.mockRestore();
			pqueueSpy.mockRestore();
		});

		it("should handle networks with undefined enabled meta", async () => {
			// Mock network without enabled property (should default to enabled)
			const mockNetwork = {
				id: () => "default-enabled-network",
				meta: () => ({}), // No enabled property
			};
			const availableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue([mockNetwork as any]);

			// Mock wallets
			const mockWallet = {
				networkId: () => "default-enabled-network",
				synchroniser: () => ({
					identity: vi.fn().mockResolvedValue(undefined),
					votes: vi.fn().mockResolvedValue(undefined),
				}),
			};
			const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([mockWallet as any]);

			// Mock pqueueSettled
			const pqueueSpy = vi.spyOn(await import("./helpers/queue"), "pqueueSettled").mockResolvedValue(undefined);

			await walletService.syncByProfile(profile);

			expect(availableNetworksSpy).toHaveBeenCalled();
			expect(walletsSpy).toHaveBeenCalled();
			expect(pqueueSpy).toHaveBeenCalledWith(expect.any(Array));

			availableNetworksSpy.mockRestore();
			walletsSpy.mockRestore();
			pqueueSpy.mockRestore();
		});

		it("should handle empty wallets array", async () => {
			// Mock available networks
			const mockNetwork = {
				id: () => "test-network",
				meta: () => ({ enabled: true }),
			};
			const availableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue([mockNetwork as any]);

			// Mock empty wallets array
			const walletsSpy = vi.spyOn(profile.wallets(), "values").mockReturnValue([]);

			// Mock pqueueSettled
			const pqueueSpy = vi.spyOn(await import("./helpers/queue"), "pqueueSettled").mockResolvedValue(undefined);

			await walletService.syncByProfile(profile);

			expect(availableNetworksSpy).toHaveBeenCalled();
			expect(walletsSpy).toHaveBeenCalled();
			expect(pqueueSpy).toHaveBeenCalledWith([]);

			availableNetworksSpy.mockRestore();
			walletsSpy.mockRestore();
			pqueueSpy.mockRestore();
		});

		it("should filter wallets that don't match available networks", async () => {
			// Mock available networks
			const mockNetwork = {
				id: () => "available-network",
				meta: () => ({ enabled: true }),
			};
			const availableNetworksSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue([mockNetwork as any]);

			// Mock wallets - one matches, one doesn't
			const matchingWallet = {
				networkId: () => "available-network",
				synchroniser: () => ({
					identity: vi.fn().mockResolvedValue(undefined),
					votes: vi.fn().mockResolvedValue(undefined),
				}),
			};
			const nonMatchingWallet = {
				networkId: () => "unavailable-network",
				synchroniser: () => ({
					identity: vi.fn().mockResolvedValue(undefined),
					votes: vi.fn().mockResolvedValue(undefined),
				}),
			};
			const walletsSpy = vi
				.spyOn(profile.wallets(), "values")
				.mockReturnValue([matchingWallet, nonMatchingWallet] as any);

			// Mock pqueueSettled
			const pqueueSpy = vi.spyOn(await import("./helpers/queue"), "pqueueSettled").mockResolvedValue(undefined);

			await walletService.syncByProfile(profile);

			expect(availableNetworksSpy).toHaveBeenCalled();
			expect(walletsSpy).toHaveBeenCalled();
			// Should only create promises for the matching wallet (2 promises: identity + votes)
			expect(pqueueSpy).toHaveBeenCalledWith(
				expect.arrayContaining([expect.any(Function), expect.any(Function)]),
			);

			availableNetworksSpy.mockRestore();
			walletsSpy.mockRestore();
			pqueueSpy.mockRestore();
		});
	});
});
