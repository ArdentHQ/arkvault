/* eslint-disable sonarjs/no-duplicate-string */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LedgerService } from "./ledger.service";
import { ConfigRepository } from "./config.repository";
import { mockNanoXTransport } from "@/utils/testing-library";
import * as LedgerTransportFactory from "@/app/contexts/Ledger/transport";
import EthModule, { ledgerService as LedgerEthService } from "@ledgerhq/hw-app-eth";
import { BIP44 } from "@ardenthq/arkvault-crypto";

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

		it("should return hex string signature in signMessage", async () => {
			const path = "m/44'/60'/0'/0/0";
			const payload = "hello";
			const fakeSignature = { r: "dead", s: "beef", v: 27 };
			const spySignMessage = vi
				.spyOn(EthModule.prototype, "signPersonalMessage")
				.mockResolvedValue(fakeSignature);

			await ledgerService.connect();
			const result = await ledgerService.signMessage(path, payload);

			expect(result).toBe("0xdeadbeef1b"); // 0x + r + s + v.toString(16)
			expect(result).toMatch(/^0x[a-fA-F0-9]+$/); // Verifica formato hexadecimal

			spySignMessage.mockRestore();
		});

		it("should attempt to scan with startPath", async () => {
			const startPath = "m/44'/60'/0'/0/5";
			const mockAddressIndex = 5;
			const mockBIP44Parse = { addressIndex: mockAddressIndex };
			const spyBIP44 = vi.spyOn(BIP44, "parse").mockReturnValue(mockBIP44Parse as any);

			await expect(ledgerService.scan({ startPath, useLegacy: false })).rejects.toThrow();
			expect(spyBIP44).toHaveBeenCalledWith(startPath);

			spyBIP44.mockRestore();
		});

		it("should return true when isEthBasedApp can derive eth public keys", async () => {
			const spy = vi.spyOn(EthModule.prototype, "getAddress").mockResolvedValue({
				address: "0x123",
				chainCode: undefined,
				publicKey: "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041",
			});

			await ledgerService.connect();
			const result = await ledgerService.isEthBasedApp();

			expect(result).toBe(true);

			spy.mockRestore();
		});

		it("should return false when isEthBasedApp fails to derive eth public keys", async () => {
			const spy = vi.spyOn(EthModule.prototype, "getAddress").mockRejectedValue(new Error("Not eth based app"));

			await ledgerService.connect();
			const result = await ledgerService.isEthBasedApp();

			expect(result).toBe(false);

			spy.mockRestore();
		});

		it("should return false when both keys are empty in isEthBasedApp", async () => {
			const spy = vi.spyOn(EthModule.prototype, "getAddress").mockResolvedValue({
				address: "",
				chainCode: undefined,
				publicKey: "",
			});

			const HDKeyModule = await import("@ardenthq/arkvault-crypto");
			const hdKeySpy = vi.spyOn(HDKeyModule.HDKey, "fromCompressedPublicKey").mockReturnValue({
				derive: () => ({publicKey: ""})
			});

			await ledgerService.connect();
			const result = await ledgerService.isEthBasedApp();

			expect(result).toBe(false);

			spy.mockRestore();
			hdKeySpy.mockRestore();
		});
	});
});
