import { describe, it, expect, vi, beforeEach } from "vitest";
import { MnemonicWithDerivationPathService } from "./mnemonic-with-derivation-path.service";
import { ConfigRepository } from "./config.repository";

const path = "m/44'/111'/0'/0/0";
const mnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";

describe("MnemonicWithDerivationPathService", () => {
	let service: MnemonicWithDerivationPathService;
	let mockConfig: ConfigRepository;

	beforeEach(() => {
		mockConfig = {
			get: vi.fn().mockReturnValue(11812),
		} as any;
		service = new MnemonicWithDerivationPathService({ config: mockConfig });
	});

	it("should create instance", () => {
		expect(service).toBeInstanceOf(MnemonicWithDerivationPathService);
	});

	it("should return public key for given mnemonic and path", () => {
		const publicKey = service.getPublicKey(mnemonic, path);

		expect(publicKey).toBeDefined();
		expect(typeof publicKey).toBe("string");
		expect(publicKey).toMatch(/^0x[a-fA-F0-9]+$/);
	});

	it("should return address for given mnemonic and path", () => {
		const address = service.getAddress(mnemonic, path);

		expect(address).toBeDefined();
		expect(typeof address).toBe("string");
		expect(address).toMatch(/^0x[a-fA-F0-9]+$/);
	});

	it("should sign transaction with correct parameters", async () => {
		const data = {
			gasLimit: "21000",
			gasPrice: "20000000000",
			nonce: 1,
			to: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
			value: "1000000000000000000",
		};

		const result = await service.sign(mnemonic, path, data);

		expect(result).toBeDefined();
		expect(result).toHaveProperty("r");
		expect(result).toHaveProperty("s");
		expect(result).toHaveProperty("v");
		expect(typeof result.r).toBe("string");
		expect(typeof result.s).toBe("string");
		expect(typeof result.v).toBe("number");
	});

	it("should use chainId from config", async () => {
		const chainId = 11812;
		mockConfig.get = vi.fn().mockReturnValue(chainId);

		const data = {
			gasLimit: "21000",
			gasPrice: "20000000000",
			nonce: 1,
			to: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
			value: "1000000000000000000",
		};

		await service.sign(mnemonic, path, data);

		expect(mockConfig.get).toHaveBeenCalledWith("crypto.network.chainId");
	});

	it("should return signature without 0x prefix", async () => {
		const data = {
			gasLimit: "21000",
			gasPrice: "20000000000",
			nonce: 1,
			to: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
			value: "1000000000000000000",
		};

		const result = await service.sign(mnemonic, path, data);

		expect(result.r).not.toMatch(/^0x/);
		expect(result.s).not.toMatch(/^0x/);
	});

	it("should return consistent results for same inputs", () => {
		const account1 = MnemonicWithDerivationPathService.getAccount(mnemonic, path);
		const account2 = MnemonicWithDerivationPathService.getAccount(mnemonic, path);

		expect(account1.address).toBe(account2.address);
		expect(account1.publicKey).toBe(account2.publicKey);
	});
});
