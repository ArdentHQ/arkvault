import { describe, it, expect, beforeEach, afterEach } from "vitest";
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

	it("should return a public key from getPublicKey", async () => {
		const path = "m/44'/60'/0'/0/0";
		const fakeExtendedKey = "abcdef";
		const fakePubKey = { derive: () => ({ publicKey: { toString: () => "deadbeef" } }) };

		// Mock getExtendedPublicKey and HDKey.fromCompressedPublicKey
		ledgerService.getExtendedPublicKey = async () => fakeExtendedKey;
		const originalFromCompressed = (global as any).HDKey?.fromCompressedPublicKey;
		const HDKeyModule = await import("@ardenthq/arkvault-crypto");
		HDKeyModule.HDKey.fromCompressedPublicKey = () => fakePubKey;

		const result = await ledgerService.getPublicKey(path);
		expect(result).toBe("deadbeef");

		// Restore
		if (originalFromCompressed) {
			HDKeyModule.HDKey.fromCompressedPublicKey = originalFromCompressed;
		}
	});
});
