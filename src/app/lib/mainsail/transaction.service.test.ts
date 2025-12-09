/* eslint-disable sonarjs/no-duplicate-string */
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
			crypto: {
				network: {
					chainId: 11812,
				}
			},
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

	it("should call builder chain and return SignedTransactionData for contractDeployment", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				bytecode: "0x60006000F3",
			},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.contractDeployment(input);
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

	it("should call builder chain and return SignedTransactionData for vote (solo unvote, sin vote)", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				unvotes: [{ id: "659A76be283644AEc2003aa8ba26485047fd1BFB" }],
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

	it("should call builder chain and return SignedTransactionData for vote with both votes and unvotes", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {
				unvotes: [{ id: "659A76be283644AEc2003aa8ba26485047fd1BFB" }],
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

	it("should call builder chain and return SignedTransactionData for usernameResignation", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.usernameResignation(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder chain and return SignedTransactionData for validatorResignation", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: {},
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory,
		} as any;

		const result = await transactionService.validatorResignation(input);
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

	it("should call legacySecondSign for confirmation mnemonic signatory in #sign", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const confirmationSignatory = await wallet.signatoryFactory().make({
			mnemonic: MAINSAIL_MNEMONICS[0],
			secondMnemonic: MAINSAIL_MNEMONICS[1],
		});

		const input = {
			data: { amount: "1", to: "0x0000000000000000000000000000000000000000" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: confirmationSignatory,
		} as any;

		const result = await transactionService.transfer(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call builder.sign for secret signatory in #sign", async () => {
		// Add handler for the secret signatory address
		server.use(
			requestMock("https://test1.com/wallets/0x41459E48257c5781c15BbE266Ad85243883c123B", {
				data: {},
			}),
		);

		const secretSignatory = await wallet.signatoryFactory().make({
			secret: "mysecret",
		});

		const input = {
			data: { amount: "1", to: "0x0000000000000000000000000000000000000000" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: secretSignatory,
		} as any;

		const result = await transactionService.transfer(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});

	it("should call #signWithLedger for ledger signatory in #sign", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x47ea9bAa16edd859C1792933556c4659A647749C", {
				data: {},
			}),
		);

		const ledgerSignatory = await wallet.signatoryFactory().make({
			// using mnemonic to make a signatory that I can spy
			// to emulate the ledger signatory
			mnemonic: MAINSAIL_MNEMONICS[0],
		});

		vi.spyOn(ledgerSignatory, "actsWithMnemonic").mockReturnValue(false);
		vi.spyOn(ledgerSignatory, "actsWithLedger").mockReturnValue(true);

		const profileLedgerSpy = vi.spyOn(profile, "ledger").mockReturnValue({
			connect: vi.fn(),
			getExtendedPublicKey: vi
				.fn()
				.mockResolvedValue("0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041"),
			sign: vi.fn(),
		});

		transactionService = new TransactionService({ config, profile });

		const input = {
			data: { amount: "1", to: "0x0000000000000000000000000000000000000000" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			signatory: ledgerSignatory,
		} as any;

		const result = await transactionService.transfer(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");

		profileLedgerSpy.mockRestore();
	});

	it("should use the provided nonce in transfer (cubre línea 324)", async () => {
		server.use(
			requestMock("https://test1.com/wallets/0x659A76be283644AEc2003aa8ba26485047fd1BFB", {
				data: {},
			}),
		);

		const input = {
			data: { amount: "1", to: "0x0000000000000000000000000000000000000000" },
			gasLimit: BigNumber.make(21000),
			gasPrice: BigNumber.make(20000000000),
			nonce: "12345",
			signatory,
		} as any;

		const result = await transactionService.transfer(input);
		expect(result).toBeDefined();
		expect(result).toHaveProperty("data");
		expect(result).toHaveProperty("serialized");
	});
});
