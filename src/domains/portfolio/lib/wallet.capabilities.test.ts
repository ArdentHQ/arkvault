import { WalletCapabilities } from "./wallet.capabilities";
import { Contracts } from "@/app/lib/profiles";
import { Enums } from "@/app/lib/mainsail";
import { BigNumber } from "@/app/lib/helpers";

describe("WalletCapabilities", () => {
	const createMockWallet = (overrides: Partial<Contracts.IReadWriteWallet> = {}): Contracts.IReadWriteWallet => ({
		address: () => "0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
		balance: () => BigNumber.make(100000000),
		hasBeenFullyRestored: () => true,
		hasSyncedWithNetwork: () => true,
		publicKey: () => undefined,
		network: () => ({
			coin: "Mainsail",
			allows: () => false,
			type: "live" as const,
		}),
		isValidator: () => false,
		isResignedValidator: () => false,
		username: () => null,
		...overrides,
	});

	describe("canBroadcast", () => {
		it("should return true when wallet is fully restored, synced, and has balance", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => true,
				hasSyncedWithNetwork: () => true,
				balance: () => BigNumber.make(100),
			});

			expect(WalletCapabilities(wallet).canBroadcast()).toBe(true);
		});

		it("should return false when wallet is not fully restored", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => false,
			});

			expect(WalletCapabilities(wallet).canBroadcast()).toBe(false);
		});

		it("should return false when wallet is not synced with network", () => {
			const wallet = createMockWallet({
				hasSyncedWithNetwork: () => false,
			});

			expect(WalletCapabilities(wallet).canBroadcast()).toBe(false);
		});

		it("should return false when wallet has zero balance", () => {
			const wallet = createMockWallet({
				balance: () => BigNumber.make(0),
			});

			expect(WalletCapabilities(wallet).canBroadcast()).toBe(false);
		});

		it("should return false when wallet has negative balance", () => {
			const wallet = createMockWallet({
				balance: () => BigNumber.make(-1),
			});

			expect(WalletCapabilities(wallet).canBroadcast()).toBe(false);
		});
	});

	describe("canSendTransfer", () => {
		it("should delegate to canBroadcast", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => true,
				hasSyncedWithNetwork: () => true,
				balance: () => BigNumber.make(100),
			});

			expect(WalletCapabilities(wallet).canSendTransfer()).toBe(true);
		});

		it("should return false when canBroadcast returns false", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => false,
			});

			expect(WalletCapabilities(wallet).canSendTransfer()).toBe(false);
		});
	});

	describe("canSendUsernameRegistration", () => {
		it("should return false when canBroadcast is false", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => false,
			});

			expect(WalletCapabilities(wallet).canSendUsernameRegistration()).toBe(false);
		});

		it("should return true when canBroadcast is true and feature is allowed", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionUsernameRegistration;
					},
					type: "live" as const,
				}),
			});

			expect(WalletCapabilities(wallet).canSendUsernameRegistration()).toBe(true);
		});

		it("should return false when feature is not allowed", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: () => false,
					type: "live" as const,
				}),
			});

			expect(WalletCapabilities(wallet).canSendUsernameRegistration()).toBe(false);
		});
	});

	describe("canSendUsernameResignation", () => {
		it("should return false when canBroadcast is false", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => false,
			});

			expect(WalletCapabilities(wallet).canSendUsernameResignation()).toBe(false);
		});

		it("should return true when canBroadcast is true, feature allowed, and wallet has username", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionUsernameRegistration;
					},
					type: "live" as const,
				}),
				username: () => "testuser",
			});

			expect(WalletCapabilities(wallet).canSendUsernameResignation()).toBe(true);
		});

		it("should return false when wallet has no username", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionUsernameRegistration;
					},
					type: "live" as const,
				}),
				username: () => null,
			});

			expect(WalletCapabilities(wallet).canSendUsernameResignation()).toBe(false);
		});

		it("should return false when feature is not allowed", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: () => false,
					type: "live" as const,
				}),
				username: () => "testuser",
			});

			expect(WalletCapabilities(wallet).canSendUsernameResignation()).toBe(false);
		});
	});

	describe("canSendValidatorRegistration", () => {
		it("should return false when canBroadcast is false", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorRegistration()).toBe(false);
		});

		it("should return true when canBroadcast is true, feature allowed, and not a validator", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionValidatorRegistration;
					},
					type: "live" as const,
				}),
				isValidator: () => false,
				isResignedValidator: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorRegistration()).toBe(true);
		});

		it("should return false when wallet is already a validator", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionValidatorRegistration;
					},
					type: "live" as const,
				}),
				isValidator: () => true,
				isResignedValidator: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorRegistration()).toBe(false);
		});

		it("should return false when wallet is a resigned validator", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionValidatorRegistration;
					},
					type: "live" as const,
				}),
				isValidator: () => false,
				isResignedValidator: () => true,
			});

			expect(WalletCapabilities(wallet).canSendValidatorRegistration()).toBe(false);
		});

		it("should return false when feature is not allowed", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: () => false,
					type: "live" as const,
				}),
				isValidator: () => false,
				isResignedValidator: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorRegistration()).toBe(false);
		});
	});

	describe("canSendValidatorResignation", () => {
		it("should return false when canBroadcast is false", () => {
			const wallet = createMockWallet({
				hasBeenFullyRestored: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorResignation()).toBe(false);
		});

		it("should return true when canBroadcast is true, feature allowed, and is a non-resigned validator", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionValidatorResignation;
					},
					type: "live" as const,
				}),
				isValidator: () => true,
				isResignedValidator: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorResignation()).toBe(true);
		});

		it("should return false when wallet is not a validator", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionValidatorResignation;
					},
					type: "live" as const,
				}),
				isValidator: () => false,
				isResignedValidator: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorResignation()).toBe(false);
		});

		it("should return false when wallet is a resigned validator", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: (feature: string) => {
						return feature === Enums.FeatureFlag.TransactionValidatorResignation;
					},
					type: "live" as const,
				}),
				isValidator: () => true,
				isResignedValidator: () => true,
			});

			expect(WalletCapabilities(wallet).canSendValidatorResignation()).toBe(false);
		});

		it("should return false when feature is not allowed", () => {
			const wallet = createMockWallet({
				network: () => ({
					coin: "Mainsail",
					allows: () => false,
					type: "live" as const,
				}),
				isValidator: () => true,
				isResignedValidator: () => false,
			});

			expect(WalletCapabilities(wallet).canSendValidatorResignation()).toBe(false);
		});
	});
});
