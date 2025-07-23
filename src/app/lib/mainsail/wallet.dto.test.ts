import { describe, it, expect, beforeEach } from "vitest";
import { WalletData } from "./wallet.dto";
import { ConfigRepository } from "./config.repository";
import { BigNumber } from "@/app/lib/helpers";

describe("WalletData", () => {
	let config: ConfigRepository;
	let walletData: WalletData;

	beforeEach(() => {
		config = new ConfigRepository({
			network: {
				currency: {
					decimals: 8,
				},
			},
		});
		walletData = new WalletData({ config });
	});

	describe("basic properties", () => {
		it("should create instance", () => {
			expect(walletData).toBeInstanceOf(WalletData);
		});

		it("should fill data correctly", () => {
			const data = { address: "test-address", balance: 1000 };
			const result = walletData.fill(data);

			expect(result).toBe(walletData);
			expect(walletData.address()).toBe("test-address");
		});

		it("should return primary key as address", () => {
			walletData.fill({ address: "test-address" });
			expect(walletData.primaryKey()).toBe("test-address");
		});

		it("should return address", () => {
			walletData.fill({ address: "test-address" });
			expect(walletData.address()).toBe("test-address");
		});

		it("should return isSelected status", () => {
			walletData.fill({ address: "test-address", isSelected: true });
			expect(walletData.isSelected()).toBe(true);

			walletData.fill({ address: "test-address", isSelected: false });
			expect(walletData.isSelected()).toBe(false);
		});

		it("should return public key", () => {
			walletData.fill({ address: "test-address", publicKey: "test-public-key" });
			expect(walletData.publicKey()).toBe("test-public-key");
		});

		it("should return undefined public key when not present", () => {
			walletData.fill({ address: "test-address" });
			expect(walletData.publicKey()).toBeUndefined();
		});
	});

	describe("balance", () => {
		it("should return balance with BigNumber", () => {
			walletData.fill({ address: "test-address", balance: 1000 });
			const balance = walletData.balance();

			expect(balance.available).toBeInstanceOf(BigNumber);
			expect(balance.fees).toBeInstanceOf(BigNumber);
			expect(balance.total).toBeInstanceOf(BigNumber);
			expect(balance.available.toHuman()).toBe(0.00001); // 1000 / 10^8
		});

		it("should handle undefined balance", () => {
			walletData.fill({ address: "test-address" });
			const balance = walletData.balance();

			expect(balance.available.toHuman()).toBe(0);
			expect(balance.fees.toHuman()).toBe(0);
			expect(balance.total.toHuman()).toBe(0);
		});
	});

	describe("nonce", () => {
		it("should return nonce as BigNumber", () => {
			walletData.fill({ address: "test-address", nonce: 5 });
			const nonce = walletData.nonce();

			expect(nonce).toBeInstanceOf(BigNumber);
			expect(nonce.toHuman()).toBe(5);
		});

		it("should handle undefined nonce", () => {
			walletData.fill({ address: "test-address" });
			const nonce = walletData.nonce();

			expect(nonce).toBeInstanceOf(BigNumber);
			expect(nonce.toHuman()).toBe(0);
		});
	});

	describe("nested properties", () => {
		it("should get secondPublicKey from root level", () => {
			walletData.fill({ address: "test-address", secondPublicKey: "test-second-key" });
			expect(walletData.secondPublicKey()).toBe("test-second-key");
		});

		it("should get secondPublicKey from attributes", () => {
			walletData.fill({
				address: "test-address",
				attributes: { secondPublicKey: "test-second-key" },
			});
			expect(walletData.secondPublicKey()).toBe("test-second-key");
		});

		it("should get username from root level", () => {
			walletData.fill({ address: "test-address", username: "test-username" });
			expect(walletData.username()).toBe("test-username");
		});

		it("should get username from attributes", () => {
			walletData.fill({
				address: "test-address",
				attributes: { username: "test-username" },
			});
			expect(walletData.username()).toBe("test-username");
		});

		it("should get validatorPublicKey from attributes", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorPublicKey: "test-validator-key" },
			});
			expect(walletData.validatorPublicKey()).toBe("test-validator-key");
		});

		it("should get rank from root level", () => {
			walletData.fill({ address: "test-address", rank: 5 });
			expect(walletData.rank()).toBe(5);
		});

		it("should get rank from attributes", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorRank: 10 },
			});
			expect(walletData.rank()).toBe(10);
		});

		it("should get votes from root level", () => {
			walletData.fill({ address: "test-address", votes: "1000" });
			const votes = walletData.votes();

			expect(votes).toBeInstanceOf(BigNumber);
			expect(votes?.toHuman()).toBe(1000);
		});

		it("should get votes from attributes", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorVoteBalance: "2000" },
			});
			const votes = walletData.votes();

			expect(votes).toBeInstanceOf(BigNumber);
			expect(votes?.toHuman()).toBe(2000);
		});

		it("should return undefined votes when not present", () => {
			walletData.fill({ address: "test-address" });
			expect(walletData.votes()).toBeUndefined();
		});
	});

	describe("validator properties", () => {
		it("should identify as validator when validatorPublicKey is present", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorPublicKey: "test-key" },
			});
			expect(walletData.isValidator()).toBe(true);
		});

		it("should not be validator when resigned", () => {
			walletData.fill({
				address: "test-address",
				attributes: {
					validatorPublicKey: "test-key",
					validatorResigned: true,
				},
			});
			expect(walletData.isValidator()).toBe(false);
		});

		it("should identify as legacy validator when validatorPublicKey is empty string", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorPublicKey: "" },
			});
			expect(walletData.isLegacyValidator()).toBe(true);
		});

		it("should identify as resigned validator", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorResigned: true },
			});
			expect(walletData.isResignedValidator()).toBe(true);
		});

		it("should identify as resigned delegate (alias for resigned validator)", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorResigned: true },
			});
			expect(walletData.isResignedDelegate()).toBe(true);
		});

		it("should get validator fee", () => {
			walletData.fill({
				address: "test-address",
				attributes: { validatorFee: 0.05 },
			});
			expect(walletData.validatorFee()).toBe(0.05);
		});
	});

	describe("second signature", () => {
		it("should identify as second signature from root level", () => {
			walletData.fill({ address: "test-address", secondPublicKey: "test-key" });
			expect(walletData.isSecondSignature()).toBe(true);
		});

		it("should identify as second signature from attributes", () => {
			walletData.fill({
				address: "test-address",
				attributes: { secondPublicKey: "test-key" },
			});
			expect(walletData.isSecondSignature()).toBe(true);
		});

		it("should not be second signature when not present", () => {
			walletData.fill({ address: "test-address" });
			expect(walletData.isSecondSignature()).toBe(false);
		});
	});

	describe("conversion methods", () => {
		it("should convert to object", () => {
			walletData.fill({
				address: "test-address",
				balance: 1000,
				isSelected: true,
				publicKey: "test-public-key",
			});
			const obj = walletData.toObject();

			expect(obj.address).toBe("test-address");
			expect(obj.publicKey).toBe("test-public-key");
			expect(obj.isSelected).toBe(true);
			expect(obj.balance).toBeDefined();
		});

		it("should convert to human readable format", () => {
			walletData.fill({
				address: "test-address",
				balance: 1000,
				publicKey: "test-public-key",
			});
			const human = walletData.toHuman();

			expect(human.address).toBe("test-address");
			expect(human.publicKey).toBe("test-public-key");
			expect(human.balance.available).toBe(0.00001); // 1000 / 10^8
			expect(typeof human.balance.available).toBe("number");
		});

		it("should return raw data", () => {
			const data = { address: "test-address", balance: 1000 };
			walletData.fill(data);
			expect(walletData.raw()).toBe(data);
		});
	});

	describe("status methods", () => {
		it("should indicate passed when data exists", () => {
			walletData.fill({ address: "test-address" });
			expect(walletData.hasPassed()).toBe(true);
		});

		it("should indicate failed when no data", () => {
			walletData.fill({});
			expect(walletData.hasFailed()).toBe(true);
		});

		it("should indicate failed when data is empty", () => {
			walletData.fill({});
			expect(walletData.hasPassed()).toBe(false);
		});
	});
});
