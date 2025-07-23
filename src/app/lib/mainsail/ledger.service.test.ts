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
});
