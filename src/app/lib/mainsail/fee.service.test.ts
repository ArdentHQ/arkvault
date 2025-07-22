import { describe, it, expect, beforeEach, vi } from "vitest";
import { FeeService } from "./fee.service";
import { ConfigRepository } from "./config.repository";
import { BigNumber } from "@/app/lib/helpers";

describe("FeeService", () => {
	let feeService: FeeService;
	let mockConfig: ConfigRepository;
	let mockProfile: any;

	beforeEach(() => {
		mockConfig = {
			host: vi.fn().mockReturnValue("https://test.com"),
		} as any;

		mockProfile = {
			id: "test-profile",
		};

		feeService = new FeeService({ config: mockConfig, profile: mockProfile });
	});

	describe("constructor", () => {
		it("should create instance with config and profile", () => {
			expect(feeService).toBeInstanceOf(FeeService);
			expect(mockConfig.host).toHaveBeenCalledWith("full", mockProfile);
			expect(mockConfig.host).toHaveBeenCalledWith("evm", mockProfile);
		});
	});

	describe("calculate", () => {
		it("should return BigNumber.ZERO", async () => {
			const mockTransaction = {
				amount: "1000000000",
				recipientId: "test-recipient",
				type: 0,
			};

			const result = await feeService.calculate(mockTransaction);

			expect(result).toEqual(BigNumber.ZERO);
		});

		it("should return BigNumber.ZERO with options", async () => {
			const mockTransaction = {
				amount: "1000000000",
				recipientId: "test-recipient",
				type: 0,
			};

			const mockOptions = {
				height: 1000,
			};

			const result = await feeService.calculate(mockTransaction, mockOptions);

			expect(result).toEqual(BigNumber.ZERO);
		});
	});
});
