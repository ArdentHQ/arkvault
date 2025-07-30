import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";
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

	describe("all", () => {
		it("should return all transaction fees", async () => {
			const mockFeesResponse = {
				data: {
					evmCall: {
						avg: "2000000000",
						max: "3000000000",
						min: "1000000000",
					},
				},
			};

			server.use(http.get("https://test.com/node/fees", () => HttpResponse.json(mockFeesResponse)));

			const result = await feeService.all();

			expect(result).toEqual({
				evmCall: expect.any(Object),
				multiPayment: expect.any(Object),
				secondSignature: expect.any(Object),
				transfer: expect.any(Object),
				usernameRegistration: expect.any(Object),
				usernameResignation: expect.any(Object),
				validatorRegistration: expect.any(Object),
				validatorResignation: expect.any(Object),
				vote: expect.any(Object),
			});
		});

		it("should handle fees with null values", async () => {
			const mockFeesResponse = {
				data: {
					evmCall: {
						avg: null,
						max: null,
						min: null,
					},
				},
			};

			server.use(http.get("https://test.com/node/fees", () => HttpResponse.json(mockFeesResponse)));

			const result = await feeService.all();

			expect(result.evmCall).toBeDefined();
		});
	});

	describe("estimateGas", () => {
		it("should estimate gas with valid payload", async () => {
			const mockPayload = {
				data: "0x12345678",
				to: "0x1234567890123456789012345678901234567890",
			};

			const mockResponse = {
				id: "1",
				jsonrpc: "2.0",
				result: "0x5208",
			};

			server.use(http.post("https://test.com/", () => HttpResponse.json(mockResponse)));

			const result = await feeService.estimateGas(mockPayload);

			expect(result).toBeInstanceOf(BigNumber);
		});

		it("should handle gas estimation with null result", async () => {
			const mockPayload = {
				data: "0x12345678",
				to: "0x1234567890123456789012345678901234567890",
			};

			const mockResponse = {
				id: "1",
				jsonrpc: "2.0",
				result: null,
			};

			server.use(http.post("https://test.com/", () => HttpResponse.json(mockResponse)));

			const result = await feeService.estimateGas(mockPayload);

			expect(result).toBeInstanceOf(BigNumber);
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
