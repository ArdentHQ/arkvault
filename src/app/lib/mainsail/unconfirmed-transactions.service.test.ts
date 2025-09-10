import { HttpResponse, http } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { UnconfirmedTransactionsService } from "@/app/lib/mainsail/unconfirmed-transactions.service";
import { server } from "@/tests/mocks/server";
import transactionFixture from "@/tests/fixtures/coins/mainsail/devnet/transactions/unconfirmed.json";

const UNCONFIRMED_ENDPOINT = "https://dwallets-evm.mainsailhq.com/tx/api/transactions/unconfirmed";

const mockConfig = {
	get: (key?: string) => {
		if (key === undefined || key === "epoch" || key === "Epoch") {
			return 0;
		}
		if (key === "network") {
			return { epoch: 0 };
		}
		return;
	},
	host: (type?: string) => {
		if (type === "tx") {
			return "https://dwallets-evm.mainsailhq.com/tx/api";
		}
		return "https://dwallets-evm.mainsailhq.com/evm/api";
	},
};

const mockProfile: any = {};

describe("UnconfirmedTransactionsService", () => {
	let service: UnconfirmedTransactionsService;

	beforeEach(() => {
		service = new UnconfirmedTransactionsService({ config: mockConfig as any, profile: mockProfile });
	});

	it("should call unconfirmed transactions without params and map response", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				// Should have no specific query params for basic call
				if (!url.searchParams.has("from") && !url.searchParams.has("to")) {
					return HttpResponse.json(transactionFixture);
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed();

		expect(res.results.length).toEqual(4);
	});

	it("should handle undefined parameters", async () => {
		server.use(http.get(UNCONFIRMED_ENDPOINT, () => HttpResponse.json(transactionFixture)));

		const res = await service.listUnconfirmed(undefined);

		expect(res.results.length).toEqual(4);
	});

	it("should pass limit parameter correctly", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const limit = url.searchParams.get("limit");

				if (limit === "50") {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ from: [], limit: 50, to: [] });

		expect(res.results.length).toEqual(4);
	});

	it("should pass multiple from/to arrays as comma-separated strings", async () => {
		const from = ["0x1111111111111111111111111111111111111111", "0x2222222222222222222222222222222222222222"];
		const to = ["0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"];

		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const limit = url.searchParams.get("limit");
				const fromParam = url.searchParams.get("from");
				const toParam = url.searchParams.get("to");

				// Check that the from and to arrays are properly serialized as comma-separated strings
				if (
					limit === "25" &&
					fromParam ===
						"0x1111111111111111111111111111111111111111,0x2222222222222222222222222222222222222222" &&
					toParam === "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA,0xBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB"
				) {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ from, limit: 25, to });

		expect(res.results.length).toEqual(4);
	});

	it("should omit empty arrays for from/to", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const fromParam = url.searchParams.get("from");
				const toParam = url.searchParams.get("to");

				// Check that empty arrays result in no from/to parameters
				if (!fromParam && !toParam) {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ from: [], to: [] });

		expect(res.results.length).toEqual(4);
	});

	it("should handle only from parameter", async () => {
		const from = ["0x1111111111111111111111111111111111111111"];

		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const fromParam = url.searchParams.get("from");
				const toParam = url.searchParams.get("to");

				if (fromParam === "0x1111111111111111111111111111111111111111" && !toParam) {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ from, to: [] });

		expect(res.results.length).toEqual(4);
	});

	it("should handle only to parameter", async () => {
		const to = ["0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"];

		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const fromParam = url.searchParams.get("from");
				const toParam = url.searchParams.get("to");

				if (!fromParam && toParam === "0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA") {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ from: [], to });

		expect(res.results.length).toEqual(4);
	});

	it("should handle missing page parameter", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const pageParam = url.searchParams.get("page");

				// Page parameter should not be passed since it's not in the service implementation
				if (!pageParam) {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ from: [], limit: 10, to: [] });

		expect(res.results.length).toEqual(0);
	});
});
