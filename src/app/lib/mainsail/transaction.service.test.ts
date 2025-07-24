import { describe, it, expect, beforeEach, vi } from "vitest";
import { server, requestMock } from "@/tests/mocks/server";
import { TransactionService } from "./transaction.service";
import { ConfigRepository } from "./config.repository";
import { BigNumber } from "@/app/lib/helpers";
import { env, MAINSAIL_MNEMONICS } from "@/utils/testing-library";

describe("TransactionService", () => {
	let config: ConfigRepository;
	let profile: any;
	let transactionService: TransactionService;
	let wallet: any;
	let signatory: any;

	beforeEach(async () => {
		config = new ConfigRepository({
			network: {
				currency: {
					decimals: 8,
				},
				hosts: [
					{
						host: "https://test1.com",
						type: "full",
					},
					{
						host: "https://test2.com",
						type: "evm",
					},
					{
						host: "https://test3.com",
						type: "tx",
					},
				],
				id: "test-network",
			},
		});

		// profile = {
		// 	hosts: () => ({
		// 		allByNetwork: () => [],
		// 	}),
		// 	ledger: () => ({
		// 		connect: vi.fn(),
		// 		getExtendedPublicKey: vi.fn(),
		// 		sign: vi.fn(),
		// 	}),
		// 	settings: () => ({
		// 		get: () => false,
		// 	}),
		// };

		profile = await env.profiles().create("test profile");

		transactionService = new TransactionService({ config, profile });

		wallet = await profile.walletFactory().fromAddress({
			address: "0x0000000000000000000000000000000000000000",
		});

		signatory = await wallet.signatoryFactory().make({
			mnemonic: MAINSAIL_MNEMONICS[0],
		});
	});

	afterEach(() => {
		env.profiles().forget(profile.id());
	});

	it("should create instance", () => {
		expect(transactionService).toBeInstanceOf(TransactionService);
	});

	it("should call builder chain and return SignedTransactionData", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: { amount: "1", to: "0x0000000000000000000000000000000000000000" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.transfer(input);
		expect(result).toBeDefined();
		// Check for expected properties
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder chain and return SignedTransactionData for validatorRegistration", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				validatorPublicKey: "659A76be283644AEc2003aa8ba26485047fd1BFB",
				value: "1000000000",
			},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.validatorRegistration(input);
		expect(result).toBeDefined();
		// Check for expected properties
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder chain and return SignedTransactionData for updateValidator", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				validatorPublicKey: "659A76be283644AEc2003aa8ba26485047fd1BFB",
			},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.updateValidator(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder chain and return SignedTransactionData for vote", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				votes: [{ id: "659A76be283644AEc2003aa8ba26485047fd1BFB" }],
			},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.vote(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder chain and return SignedTransactionData for multiPayment", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				payments: [{ amount: "1", to: "0x0000000000000000000000000000000000000000" }],
			},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.multiPayment(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder chain and return SignedTransactionData for usernameRegistration", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				username: "testuser",
			},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.usernameRegistration(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should throw error when transfer input is missing gasPrice", async () => {
		const input = {
			data: { amount: "100", to: "test-address" },
			gasLimit: BigNumber.make(21000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.transfer(input)).rejects.toThrow("Expected gasPrice to be defined");
	});

	it("should throw error when transfer input is missing gasLimit", async () => {
		const input = {
			data: { amount: "100", to: "test-address" },
			gasPrice: BigNumber.make(20000000000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.transfer(input)).rejects.toThrow("Expected gasLimit to be defined");
	});

	it("should throw error when transfer input is missing amount", async () => {
		const input = {
			data: { to: "test-address" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.transfer(input)).rejects.toThrow("Expected amount to be defined");
	});

	it("should throw error when validatorRegistration input is missing validatorPublicKey", async () => {
		const input = {
			data: { value: "100" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.validatorRegistration(input)).rejects.toThrow(
			"Expected validatorPublicKey to be defined",
		);
	});

	it("should throw error when updateValidator input is missing validatorPublicKey", async () => {
		const input = {
			data: {},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.updateValidator(input)).rejects.toThrow(
			"Expected validatorPublicKey to be defined",
		);
	});

	it("should throw error when multiPayment input is missing payments", async () => {
		const input = {
			data: {},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.multiPayment(input)).rejects.toThrow("Expected payments to be defined");
	});

	it("should throw error when usernameRegistration input is missing username", async () => {
		const input = {
			data: {},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: { signingKey: () => "test-key" },
		} as any;

		await expect(transactionService.usernameRegistration(input)).rejects.toThrow("Expected username to be defined");
	});
});
