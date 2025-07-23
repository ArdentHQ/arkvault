import { describe, it, expect, beforeEach } from "vitest";
import { LedgerService } from "./ledger.service";
import { ConfigRepository } from "./config.repository";

describe("LedgerService", () => {
	let ledgerService: LedgerService;
	let mockConfig: ConfigRepository;

	beforeEach(() => {
		mockConfig = {
			get: () => 60,
		} as any;
		ledgerService = new LedgerService({ config: mockConfig });
	});

	it("should create instance", () => {
		expect(ledgerService).toBeInstanceOf(LedgerService);
	});
});
