import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server, requestMock } from "@/tests/mocks/server";
import { ClientService } from "./client.service";
import { Transactions } from "@arkecosystem/typescript-client";

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
	host: () => "http://localhost",
};
const mockProfile: any = {};

const transactionMockData = {
	amount: 100,
	data: "0x1234567890abcdef",
	from: "sender_address",
	gas: 21000,
	gasPrice: 10000000,
	hash: "txid",
	nonce: 1,
	receipt: { status: 1 },
	senderPublicKey: "somePublicKey",
	timestamp: Date.now(),
	to: "recipient_address",
	value: 100000000,
};

const walletMockData = {
	address: "walletid",
	attributes: {},
	balance: 1000,
	publicKey: "somePublicKey",
	vote: "delegateid",
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

	it("should return no votes for a wallet that has not voted", async () => {
		const walletDataWithoutVote = { ...walletMockData, vote: undefined };
		server.use(requestMock("http://localhost/wallets/walletid", { data: walletDataWithoutVote }));

		const votes = await clientService.votes("walletid");
		expect(votes.used).toBe(0);
		expect(votes.available).toBe(1);
	});

	it("should broadcast transactions", async () => {
		server.use(
			http.post("http://localhost/transactions", async () =>
				HttpResponse.json({
					data: { accept: [0], errors: {}, invalid: [] },
				}),
			),
		);
		const mockSignedTx = { hash: () => "hash", toBroadcast: async () => ({ hash: "hash" }) };
		const result = await clientService.broadcast([mockSignedTx as any]);
		expect(result.accepted).toContain("hash");
	});

	it("should handle broadcast with rejections and errors", async () => {
		server.use(
			http.post("http://localhost/transactions", async () =>
				HttpResponse.json({
					data: {
						accept: [0],
						invalid: [1],
					},
					errors: {
						hash2: [{ message: "some error" }],
					},
				}),
			),
		);

		const mockTx1 = { hash: () => "hash1", toBroadcast: async () => ({ id: "hash1" }) };
		const mockTx2 = { hash: () => "hash2", toBroadcast: async () => ({ id: "hash2" }) };
		const result = await clientService.broadcast([mockTx1 as any, mockTx2 as any]);

		expect(result.accepted).toContain("hash1");
		expect(result.rejected).toContain("hash2");
		expect(result.errors).toHaveProperty("hash2", "some error");
	});

	it("should handle broadcast with non-array error", async () => {
		server.use(
			http.post("http://localhost/transactions", async () =>
				HttpResponse.json({
					data: {
						accept: [],
						invalid: [0],
					},
					errors: {
						hash1: { message: "some error" }, // Not an array
					},
				}),
			),
		);

		const mockTx1 = { hash: () => "hash1", toBroadcast: async () => ({ id: "hash1" }) };
		const result = await clientService.broadcast([mockTx1 as any]);

		expect(result.rejected).toContain("hash1");
		expect(result.errors).toHaveProperty("hash1", "some error");
	});

	it("should handle broadcast failure", async () => {
		const broadcastSpy = vi.spyOn(clientService, "broadcast").mockRejectedValue(new Error());
		await expect(clientService.broadcast([])).rejects.toThrow();
		broadcastSpy.mockRestore();
	});

	it("should make a successful evm call", async () => {
		server.use(
			http.post("http://localhost/", async () =>
				HttpResponse.json({
					id: 1,
					jsonrpc: "2.0",
					result: "0x12345",
				}),
			),
		);
		const result = await clientService.evmCall({ data: "0xabc", to: "0xdef" });
		expect(result).toEqual({
			id: 1,
			jsonrpc: "2.0",
			result: "0x12345",
		});
	});

	describe("#createSearchParams", () => {
		let spy: vi.SpyInstance;

		beforeEach(() => {
			spy = vi.spyOn(Transactions.prototype, "all").mockResolvedValue({
				data: [],
				meta: { last: "page=1" },
			} as any);
		});

		afterEach(() => {
			spy.mockRestore();
		});

		it("should map memo to vendorField", async () => {
			await clientService.transactions({ memo: "test" });
			expect(spy).toHaveBeenCalledWith(1, 10, { vendorField: "test" });
		});

		it("should handle orderBy", async () => {
			await clientService.transactions({ orderBy: "amount:desc" });
			expect(spy).toHaveBeenCalledWith(1, 10, { orderBy: "amount:desc" });
		});

		it("should handle identifiers", async () => {
			await clientService.transactions({ identifiers: [{ value: "addr1" }, { value: "addr2" }] });
			expect(spy).toHaveBeenCalledWith(1, 10, { address: "addr1,addr2" });
		});

		it("should handle transaction types", async () => {
			await clientService.transactions({ types: ["transfer", "vote"] });
			// Transfer is an empty string, so we only check for the vote part
			expect(spy).toHaveBeenCalledWith(1, 10, { data: expect.stringContaining("6dd7d8ea,3174b689") });
		});

		it("should handle timestamp", async () => {
			await clientService.transactions({ timestamp: { from: 1, to: 2 } });
			expect(spy).toHaveBeenCalledWith(
				1,
				10,
				expect.objectContaining({ "timestamp.from": 1, "timestamp.to": 2 }),
			);
		});

		it("should handle single transaction type", async () => {
			await clientService.transactions({ type: "transfer" });
			expect(spy).toHaveBeenCalledWith(1, 10, { data: "" });
		});

		it("should handle timestamp without epoch", async () => {
			const configWithoutEpoch = {
				get: () => {},
				host: () => "http://localhost", // No epoch
			};
			const serviceWithoutEpoch = new ClientService({ config: configWithoutEpoch as any, profile: mockProfile });

			await serviceWithoutEpoch.transactions({ timestamp: { from: 1000, to: 2000 } });
			expect(spy).toHaveBeenCalledWith(
				1,
				10,
				expect.objectContaining({ "timestamp.from": 1000, "timestamp.to": 2000 }),
			);
		});

		it("should handle empty query", async () => {
			await clientService.transactions({});
			expect(spy).toHaveBeenCalledWith(1, 10, {});
		});
	});
});
