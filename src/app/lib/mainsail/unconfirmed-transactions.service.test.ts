/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnconfirmedTransactionsService } from "@/app/lib/mainsail/unconfirmed-transactions.service";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/unconfirmed.json";

describe("UnconfirmedTransactionsService", () => {
	let getMock: ReturnType<typeof vi.fn>;
	let httpClient: any;

	beforeEach(() => {
		getMock = vi.fn().mockResolvedValue({
			json: vi.fn().mockResolvedValue(transactionFixture),
		});
		httpClient = { get: getMock };
	});

	it("should build URL without params and return fixture", async () => {
		const service = new UnconfirmedTransactionsService({
			host: "https://dwallets-evm.mainsailhq.com/tx/api/",
			httpClient,
		});

		const res = await service.listUnconfirmed();

		expect(getMock).toHaveBeenCalledTimes(1);
		expect(getMock).toHaveBeenCalledWith(
			"https://dwallets-evm.mainsailhq.com/tx/api/transactions/unconfirmed",
			undefined,
			{ ttl: 5000 },
		);
		expect(res).toEqual(transactionFixture);
	});

	it("should add page and limit query params", async () => {
		const service = new UnconfirmedTransactionsService({
			host: "https://dwallets-evm.mainsailhq.com/tx/api",
			httpClient,
		});

		const res = await service.listUnconfirmed({ limit: 50, page: 2 });

		expect(getMock).toHaveBeenCalledWith(
			"https://dwallets-evm.mainsailhq.com/tx/api/transactions/unconfirmed?page=2&limit=50",
			undefined,
			{ ttl: 5000 },
		);

		expect(res).toEqual(transactionFixture);
	});

	it("should add multiple from/to params in order", async () => {
		const service = new UnconfirmedTransactionsService({
			host: "https://dwallets-evm.mainsailhq.com/tx/api",
			httpClient,
		});

		const from = ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"];
		const to = ["0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"];

		await service.listUnconfirmed({ from, limit: 25, page: 1, to });

		const expectedUrl =
			"https://dwallets-evm.mainsailhq.com/tx/api/transactions/unconfirmed" +
			"?page=1&limit=25" +
			`&from=${from[0]}&from=${from[1]}` +
			`&to=${to[0]}&to=${to[1]}`;

		expect(getMock).toHaveBeenCalledWith(expectedUrl, undefined, { ttl: 5000 });
	});

	it("should omit empty arrays (no query string for empty from/to)", async () => {
		const service = new UnconfirmedTransactionsService({
			host: "https://dwallets-evm.mainsailhq.com/tx/api",
			httpClient,
		});

		await service.listUnconfirmed({ from: [], to: [] });

		expect(getMock).toHaveBeenCalledWith(
			"https://dwallets-evm.mainsailhq.com/tx/api/transactions/unconfirmed",
			undefined,
			{ ttl: 5000 },
		);
	});
});
