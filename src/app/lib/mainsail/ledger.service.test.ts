import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LedgerService } from "./ledger.service";
import { ConfigRepository } from "./config.repository";
import { mockNanoXTransport } from "@/utils/testing-library";
import * as LedgerTransportFactory from "@/app/contexts/Ledger/transport";
import EthModule, { ledgerService as LedgerEthService } from "@ledgerhq/hw-app-eth";

describe("LedgerService", () => {
	let ledgerService: LedgerService;
	let mockConfig: ConfigRepository;
	let transportMock: any;

	beforeEach(() => {
		mockConfig = { get: () => 60 } as any;
		ledgerService = new LedgerService({ config: mockConfig });
		transportMock = mockNanoXTransport();
	});

	afterEach(() => {
		transportMock.mockRestore();
	});

	it("should create instance", () => {
		expect(ledgerService).toBeInstanceOf(LedgerService);
	});

	it("should connect successfully", async () => {
		await expect(ledgerService.connect()).resolves.not.toThrow();
	});

	it("should disconnect without error", async () => {
		await expect(ledgerService.disconnect()).resolves.not.toThrow();
	});

	it("should return version as '1'", async () => {
		await expect(ledgerService.getVersion()).resolves.toBe("1");
	});

	it("should return slip44 from config", () => {
		expect(ledgerService.slip44()).toBe(60);
	});

	it("should call disconnect on onPreDestroy", async () => {
		const disconnectSpy = vi.spyOn(ledgerService, "disconnect");
		await ledgerService.onPreDestroy();
		expect(disconnectSpy).toHaveBeenCalled();
	});

	it("should call close on ledger when disconnect is called", async () => {
		const closeSpy = vi.fn();
		const mockTransport = {
			close: closeSpy,
			decorateAppAPIMethods: () => {},
		};
		vi.spyOn(LedgerTransportFactory, "connectedTransport").mockResolvedValueOnce(mockTransport);
		const ledgerService = new LedgerService({ config: { get: () => 60 } as any });
		await ledgerService.connect();
		await ledgerService.disconnect();
		expect(closeSpy).toHaveBeenCalled();
	});

	describe("after connect", () => {
		beforeEach(async () => {
			await ledgerService.connect();
		});

		it("should check if device is NanoS", async () => {
			await expect(ledgerService.isNanoS()).resolves.toBeDefined();
		});

		it("should check if device is NanoX", async () => {
			await expect(ledgerService.isNanoX()).resolves.toBeDefined();
		});

		it("should attempt to get extended public key", async () => {
			const path = "m/44'/60'/0'/0/0";
			await expect(ledgerService.getExtendedPublicKey(path)).rejects.toThrow();
		});

		it("should attempt to get public key", async () => {
			const path = "m/44'/60'/0'/0/0";
			await expect(ledgerService.getPublicKey(path)).rejects.toThrow();
		});

		it("should attempt to sign", async () => {
			const path = "m/44'/60'/0'/0/0";
			const serialized = "0x1234";
			await expect(ledgerService.sign(path, serialized)).rejects.toThrow();
		});

		it("should attempt to sign message", async () => {
			const path = "m/44'/60'/0'/0/0";
			const payload = "hello";
			await expect(ledgerService.signMessage(path, payload)).rejects.toThrow();
		});

		it("should attempt to scan", async () => {
			await expect(ledgerService.scan()).rejects.toThrow();
		});

		it("should scan and create wallet data when getExtendedPublicKey works", async () => {
			// Mock getExtendedPublicKey to return a valid public key
			const mockPublicKey = "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041";
			vi.spyOn(ledgerService, "getExtendedPublicKey").mockResolvedValue(mockPublicKey);

			const result = await ledgerService.scan({ pageSize: 1, useLegacy: false });

			expect(result).toBeDefined();
			expect(Object.keys(result)).toHaveLength(1);

			const walletPath = Object.keys(result)[0];
			const wallet = result[walletPath];
			expect(wallet.address()).toBeDefined();
			expect(wallet.balance()).toBeDefined();
		});

		it("should handle busy error and retry getExtendedPublicKey until success", async () => {
			let callCount = 0;
			const expectedKey = "pubkey123";
			const spy = vi.spyOn(EthModule.prototype, "getAddress").mockImplementation(() => {
				callCount++;
				if (callCount < 3) {
					const error = new Error("busy");
					(error as any).message = "busy";
					return Promise.reject(error);
				}
				return Promise.resolve({ address: "", chainCode: undefined, publicKey: expectedKey });
			});
			mockNanoXTransport();
			await ledgerService.connect();
			const result = await ledgerService.getExtendedPublicKey("m/44'/60'/0'/0/0");
			expect(result).toBe(expectedKey);
			expect(callCount).toBe(3);
			spy.mockRestore();
		});

		it("should derive and return public key in getPublicKey", async () => {
			const path = "m/44'/60'/0'/0/0";
			const fakeExtendedKey = "abcdef";
			const fakePubKey = {
				derive: vi.fn().mockReturnValue({ publicKey: { toString: vi.fn().mockReturnValue("deadbeef") } }),
			};
			vi.spyOn(ledgerService, "getExtendedPublicKey").mockResolvedValue(fakeExtendedKey);
			const HDKeyModule = await import("@ardenthq/arkvault-crypto");
			const spy = vi.spyOn(HDKeyModule.HDKey, "fromCompressedPublicKey").mockReturnValue(fakePubKey as any);
			const result = await ledgerService.getPublicKey(path);
			expect(result).toBe("deadbeef");
			expect(fakePubKey.derive).toHaveBeenCalled();
			spy.mockRestore();
		});

		it("should throw if sign is called without transport", async () => {
			// Disconnect to ensure #transport is undefined
			await ledgerService.connect();
			// @ts-expect-error: force undefined
			ledgerService["#transport"] = undefined;
			await expect(ledgerService.sign("m/44'/60'/0'/0/0", "0x1234")).rejects.toThrow();
		});

		it("should throw if signMessage is called without transport", async () => {
			await ledgerService.connect();
			// @ts-expect-error: force undefined
			ledgerService["#transport"] = undefined;
			await expect(ledgerService.signMessage("m/44'/60'/0'/0/0", "hello")).rejects.toThrow();
		});

		it("should throw if sign throws an unexpected error", async () => {
			await ledgerService.connect();
			const error = new Error("unexpected");
			const spy = vi.spyOn(EthModule.prototype, "signTransaction").mockImplementation(() => {
				throw error;
			});
			await expect(ledgerService.sign("m/44'/60'/0'/0/0", "0x1234")).rejects.toThrow();
			spy.mockRestore();
		});

		it("should throw if signMessage throws an unexpected error", async () => {
			await ledgerService.connect();
			const error = new Error("unexpected");
			const spy = vi.spyOn(EthModule.prototype, "signPersonalMessage").mockImplementation(() => {
				throw error;
			});
			await expect(ledgerService.signMessage("m/44'/60'/0'/0/0", "hello")).rejects.toThrow();
			spy.mockRestore();
		});

		it("should return signature object with adjusted v in sign", async () => {
			const path = "m/44'/60'/0'/0/0";
			const serialized = "0x1234";
			const chainId = 99;
			const fakeSignature = { r: "r", s: "s", v: "100" }; // 0x100 = 256
			const fakeResolution = {
				domains: [],
				erc20Tokens: [],
				externalPlugin: [],
				nfts: [],
				plugin: [],
			};
			const spyResolve = vi.spyOn(LedgerEthService, "resolveTransaction").mockResolvedValue(fakeResolution);
			const spySignTx = vi
				.spyOn(EthModule.prototype, "signTransaction")
				.mockImplementation(() => Promise.resolve(fakeSignature));
			const spyConfig = vi.spyOn(mockConfig, "get").mockReturnValue(chainId);

			await ledgerService.connect();
			const result = await ledgerService.sign(path, serialized);
			expect(result).toHaveProperty("r", "r");
			expect(result).toHaveProperty("s", "s");
			expect(typeof result.v).toBe("number");

			spyResolve.mockRestore();
			spySignTx.mockRestore();
			spyConfig.mockRestore();
		});
	});
});
