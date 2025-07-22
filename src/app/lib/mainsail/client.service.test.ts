import { describe, it, expect, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";
import { server, requestMock } from "@/tests/mocks/server";
import { ClientService } from "./client.service";

const mockConfig = {
	host: () => "http://localhost",
	get: (key?: string) => {
		if (key === undefined || key === "epoch" || key === "Epoch") return 0;
		if (key === "network") return { epoch: 0 };
		return undefined;
	},
};
const mockProfile: any = {};

const transactionMockData = {
	hash: "txid", // El DTO usa hash() para obtener el ID
	amount: 100,
	data: "0x1234567890abcdef",
	from: "sender_address",
	to: "recipient_address",
	gas: 21000,
	gasPrice: 10000000,
	nonce: 1,
	receipt: { status: 1 },
	senderPublicKey: "somePublicKey",
	timestamp: Date.now(),
	value: 100000000,
};

const walletMockData = {
	address: "walletid", // El DTO usa address() o primaryKey()
	vote: "delegateid",
	balance: 1000,
	publicKey: "somePublicKey",
	attributes: {},
};

const validatorMockData = {
	...walletMockData,
	address: "validatorid",
};

describe("ClientService", () => {
	let clientService: ClientService;

	beforeEach(() => {
		clientService = new ClientService({ config: mockConfig as any, profile: mockProfile });
	});

	it("should fetch a transaction", async () => {
		server.use(requestMock("http://localhost/transactions/txid", { data: transactionMockData }));
		const tx = await clientService.transaction("txid");
		expect(tx).toBeDefined();
		expect(tx.hash()).toBe("txid");
	});

	it("should fetch transactions", async () => {
		server.use(
			http.get(/http:\/\/localhost\/transactions.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "1" && url.searchParams.get("limit") === "10") {
					return HttpResponse.json({
						data: [transactionMockData],
						meta: { last: "page=1", next: null, previous: null, self: "page=1" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const txs = await clientService.transactions({ page: 1 });
		expect(txs).toBeDefined();
		expect(txs.items()).toHaveLength(1);
	});

	it("should fetch a wallet", async () => {
		server.use(requestMock("http://localhost/wallets/walletid", { data: walletMockData }));
		const wallet = await clientService.wallet({ value: "walletid" });
		expect(wallet).toBeDefined();
		expect(wallet.primaryKey()).toBe("walletid");
	});

	it("should fetch wallets", async () => {
		server.use(
			http.get(/http:\/\/localhost\/wallets.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "1" && url.searchParams.get("limit") === "10") {
					return HttpResponse.json({
						data: [walletMockData],
						meta: { last: "page=1", next: null, previous: null, self: "page=1" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const wallets = await clientService.wallets({ page: 1 });
		expect(wallets).toBeDefined();
		expect(wallets.items()).toHaveLength(1);
	});

	it("should fetch a validator", async () => {
		server.use(requestMock("http://localhost/validators/validatorid", { data: validatorMockData }));
		const validator = await clientService.validator("validatorid");
		expect(validator).toBeDefined();
		expect(validator.primaryKey()).toBe("validatorid");
	});

	it("should fetch validators", async () => {
		server.use(
			http.get(/http:\/\/localhost\/validators.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "1" && url.searchParams.get("limit") === "10") {
					return HttpResponse.json({
						data: [validatorMockData],
						meta: { last: "page=1", next: null, previous: null, self: "page=1" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const validators = await clientService.validators();
		expect(validators).toBeDefined();
		expect(validators.items()).toHaveLength(1);
	});

	it("should fetch votes", async () => {
		server.use(requestMock("http://localhost/wallets/walletid", { data: walletMockData }));
		const votes = await clientService.votes("walletid");
		expect(votes).toBeDefined();
		expect(votes.used).toBe(1);
	});

	it("should broadcast transactions", async () => {
		server.use(
			http.post("http://localhost/transactions", async () => {
				return HttpResponse.json({
					data: { accept: [0], invalid: [], errors: {} },
				});
			}),
		);
		const mockSignedTx = { toBroadcast: async () => ({ hash: "hash" }), hash: () => "hash" };
		const result = await clientService.broadcast([mockSignedTx as any]);
		expect(result.accepted).toContain("hash");
	});

	it("should handle evmCall errors", async () => {
		server.use(
			http.post("http://localhost/", () => {
				return HttpResponse.error();
			}),
		);
		await expect(clientService.evmCall({ data: "0x", to: "0x" })).rejects.toThrow();
	});
});
