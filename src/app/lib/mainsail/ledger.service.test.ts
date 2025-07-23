import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { LedgerService } from "./ledger.service";
import { ConfigRepository } from "./config.repository";
import { mockNanoXTransport } from "@/utils/testing-library";

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
	});
});
