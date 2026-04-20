import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { TransactionFeeService, GasLimit } from "./transaction-fee.service";
import { BigNumber } from "@/app/lib/helpers";
import { IProfile } from "@/app/lib/profiles/contracts";
import { env, getDefaultProfileId } from "@/utils/testing-library";

describe("TransactionFeeService", () => {
	let service: TransactionFeeService;
	let mockNetwork: any;
	let mockEnv: any;
	let profile: IProfile;
	const address = "0x1234567890123456789012345678901234567890";

	beforeEach(() => {
		profile = env.profiles().findById(getDefaultProfileId());
		vi.spyOn(profile.tokens().selected(), "items").mockReturnValue([]);

		mockNetwork = {
			fees: () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(21000)),
			}),
			id: () => "mainsail.devnet",
		};

		mockEnv = {
			fees: () => ({
				findByType: vi.fn().mockResolvedValue({ avg: "1000", max: "2000", min: "500" }),
				sync: vi.fn().mockResolvedValue(undefined),
			}),
		};

		service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile });
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("gasLimit", () => {
		it("should return gas with 20% buffer when estimate is non-zero", async () => {
			mockNetwork.fees = () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(100)),
			});

			service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile: profile });

			const result = await service.gasLimit({ recipientAddress: address, senderAddress: address }, "transfer");
			expect(result.toString()).toBe("120");
		});

		it("should return fallback gas limit for multiPayment when estimate is zero", async () => {
			mockNetwork.fees = () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(0)),
			});

			service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile: profile });

			const result = await service.gasLimit(
				{
					recipients: [{ address, amount: 100 }],
					senderAddress: address,
				},
				"multiPayment",
			);
			expect(result.toString()).toBe(GasLimit.multiPayment.times(1).toString());
		});

		it("should return fallback gas limit for multiPayment with multiple recipients", async () => {
			mockNetwork.fees = () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(0)),
			});
			service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile: profile });

			const result = await service.gasLimit(
				{
					recipients: [
						{ address, amount: 100 },
						{ address, amount: 200 },
						{ address, amount: 300 },
					],
					senderAddress: address,
				},
				"multiPayment",
			);
			expect(result.toString()).toBe(GasLimit.multiPayment.times(3).toString());
		});

		it("should return fallback gas limit for multiPayment with empty recipients", async () => {
			mockNetwork.fees = () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(0)),
			});
			service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile: profile });

			const result = await service.gasLimit(
				{
					recipients: [],
					senderAddress: address,
				},
				"multiPayment",
			);
			expect(result.toString()).toBe(GasLimit.multiPayment.times(0).toString());
		});

		it("should return fallback gas limit for transfer when estimate is zero", async () => {
			mockNetwork.fees = () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(0)),
			});
			service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile: profile });

			const result = await service.gasLimit({ recipientAddress: address, senderAddress: address }, "transfer");
			expect(result.toString()).toBe(GasLimit.transfer.toString());
		});

		it("should return fallback gas limit for vote when estimate is zero", async () => {
			mockNetwork.fees = () => ({
				estimateGas: vi.fn().mockResolvedValue(BigNumber.make(0)),
			});
			service = new TransactionFeeService({ env: mockEnv, network: mockNetwork, profile: profile });

			const result = await service.gasLimit(
				{
					senderAddress: address,
					voteAddresses: [address],
				},
				"vote",
			);
			expect(result.toString()).toBe(GasLimit.vote.toString());
		});
	});

	describe("calculateFees", () => {
		it("should calculate fees for transfer", async () => {
			const result = await service.calculateFees("transfer");
			expect(result).toEqual({ avg: "1000", max: "2000", min: "500" });
		});

		it("should calculate fees for updateValidator", async () => {
			const result = await service.calculateFees("updateValidator");
			expect(result).toEqual({ avg: "1000", max: "2000", min: "500" });
		});
	});
});
