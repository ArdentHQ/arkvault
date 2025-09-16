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
				if (!url.searchParams.has("address")) {
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

		const res = await service.listUnconfirmed({ address: [], limit: 50 });

		expect(res.results.length).toEqual(4);
	});

	it("should omit empty arrays for address", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const addressParam = url.searchParams.get("address");

				if (!addressParam) {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ address: [] });

		expect(res.results.length).toEqual(4);
	});

	it("should handle only address parameter", async () => {
		const address = ["0x1111111111111111111111111111111111111111"];

		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const addressParam = url.searchParams.get("address");

				if (addressParam === "0x1111111111111111111111111111111111111111") {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ address });

		expect(res.results.length).toEqual(4);
	});

	it("should handle page parameter correctly", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const pageParam = url.searchParams.get("page");
				const limitParam = url.searchParams.get("limit");
				const addressParam = url.searchParams.get("address");

				if (pageParam === "2" && limitParam === "10" && addressParam === "0x1111") {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({ page: 2, limit: 10, address: ["0x1111"] });

		expect(res.results.length).toEqual(4);
	});

	it("should handle multiple addresses", async () => {
		server.use(
			http.get(UNCONFIRMED_ENDPOINT, ({ request }) => {
				const url = new URL(request.url);
				const addressParam = url.searchParams.get("address");

				if (addressParam === "0x1111,0x2222") {
					return HttpResponse.json(transactionFixture);
				}

				return HttpResponse.json({ data: [], meta: {} });
			}),
		);

		const res = await service.listUnconfirmed({
			address: ["0x1111", "0x2222"]
		});

		expect(res.results.length).toEqual(4);
	});
});