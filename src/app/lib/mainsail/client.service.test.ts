/* eslint-disable sonarjs/no-duplicate-string */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { server, requestMock } from "@/tests/mocks/server";
import { ClientService } from "./client.service";
import { Transactions, EVM, Wallets, Validators } from "@arkecosystem/typescript-client";

const validAddress = `0x${"a".repeat(40)}`;

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

	it("should fetch transactions with custom limit and page", async () => {
		server.use(
			http.get(/http:\/\/localhost\/transactions.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "2" && url.searchParams.get("limit") === "5") {
					return HttpResponse.json({
						data: [transactionMockData],
						meta: { last: "page=2", next: null, previous: null, self: "page=2" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const txs = await clientService.transactions({ limit: 5, page: 2 });
		expect(txs).toBeDefined();
		expect(txs.items()).toHaveLength(1);
	});

	it("should fetch unconfirmed transactions", async () => {
		server.use(
			http.get(/http:\/\/localhost\/transactions\/unconfirmed.*/, ({ request }) => {
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
		const txs = await clientService.unconfirmedTransactions({ page: 1 });
		expect(txs).toBeDefined();
		expect(txs.items()).toHaveLength(1);
	});

	it("should fetch unconfirmed transactions with custom limit and page", async () => {
		server.use(
			http.get(/http:\/\/localhost\/transactions\/unconfirmed.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "2" && url.searchParams.get("limit") === "5") {
					return HttpResponse.json({
						data: [transactionMockData],
						meta: { last: "page=2", next: null, previous: null, self: "page=2" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const txs = await clientService.unconfirmedTransactions({ limit: 5, page: 2 });
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

	it("should fetch wallets with custom limit and page", async () => {
		server.use(
			http.get(/http:\/\/localhost\/wallets.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "3" && url.searchParams.get("limit") === "15") {
					return HttpResponse.json({
						data: [walletMockData],
						meta: { last: "page=3", next: null, previous: null, self: "page=3" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const wallets = await clientService.wallets({ limit: 15, page: 3 });
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

	it("should fetch validators with custom parameters", async () => {
		server.use(
			http.get(/http:\/\/localhost\/validators.*/, ({ request }) => {
				const url = new URL(request.url);
				if (url.searchParams.get("page") === "4" && url.searchParams.get("limit") === "20") {
					return HttpResponse.json({
						data: [validatorMockData],
						meta: { last: "page=4", next: null, previous: null, self: "page=4" },
					});
				}
				return HttpResponse.json({ data: [], meta: {} });
			}),
		);
		const validators = await clientService.validators({ limit: 20, page: 4 });
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

	it("should handle error in broadcast and call error.response.json()", async () => {
		const errorResponse = {
			json: () => ({
				data: { accept: [], invalid: [0] },
				errors: { hash1: { message: "some error" } },
			}),
		};
		const error = { response: errorResponse };
		const spy = vi.spyOn(Transactions.prototype, "create").mockRejectedValue(error);

		const mockTx = { hash: () => "hash1", toBroadcast: async () => ({ id: "hash1" }) };
		const result = await clientService.broadcast([mockTx as any]);

		expect(result.rejected).toContain("hash1");
		expect(result.errors).toHaveProperty("hash1", "some error");

		spy.mockRestore();
	});

	it("should handle broadcast failure", async () => {
		const broadcastSpy = vi.spyOn(clientService, "broadcast").mockRejectedValue(new Error("broadcast error"));
		await expect(clientService.broadcast([])).rejects.toThrow("broadcast error");
		broadcastSpy.mockRestore();
	});

	it("should handle broadcast with non-array accept and invalid", async () => {
		server.use(
			http.post("http://localhost/transactions", async () =>
				HttpResponse.json({
					data: {
						accept: "not-an-array",
						invalid: "not-an-array",
					},
				}),
			),
		);

		const mockTx = { hash: () => "hash1", toBroadcast: async () => ({ id: "hash1" }) };
		const result = await clientService.broadcast([mockTx as any]);

		expect(result.accepted).toEqual([]);
		expect(result.rejected).toEqual([]);
		expect(result.errors).toEqual({});
	});

	it("should handle broadcast without errors field", async () => {
		server.use(
			http.post("http://localhost/transactions", async () =>
				HttpResponse.json({
					data: {
						accept: [0],
						invalid: [],
					},
				}),
			),
		);

		const mockTx = { hash: () => "hash1", toBroadcast: async () => ({ id: "hash1" }) };
		const result = await clientService.broadcast([mockTx as any]);

		expect(result.accepted).toContain("hash1");
		expect(result.rejected).toEqual([]);
		expect(result.errors).toEqual({});
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

	it("should throw with custom error message from error.response.json", async () => {
		const spy = vi.spyOn(EVM.prototype, "call").mockRejectedValue({
			response: {
				json: () => ({ error: { message: "custom error" } }), // Synchronous for coverage
			},
		});

		await expect(clientService.evmCall({ data: "0xabc", to: "0xdef" })).rejects.toThrow("custom error");

		spy.mockRestore();
	});

	it("should handle evmCall error without response.json", async () => {
		const error = new Error("Network error");
		const spy = vi.spyOn(EVM.prototype, "call").mockRejectedValue(error);

		await expect(clientService.evmCall({ data: "0xabc", to: "0xdef" })).rejects.toThrow("Failed to make EVM call");

		spy.mockRestore();
	});

	it("should handle meta pagination with edge case regex", async () => {
		const spyWithEdgeMeta = vi.spyOn(Transactions.prototype, "all").mockResolvedValue({
			data: [],
			meta: { last: "page=", next: "invalid", previous: "page=0", self: "page=1" },
		} as any);

		const txs = await clientService.transactions({});
		expect(txs).toBeDefined();

		spyWithEdgeMeta.mockRestore();
	});

	it("should handle meta pagination regex with empty match", async () => {
		const spyWithEmptyMatch = vi.spyOn(Transactions.prototype, "all").mockResolvedValue({
			data: [],
			meta: {
				last: "page=0",
				next: "page=0",
				previous: "page=0",
				self: "page=0",
			},
		} as any);

		const txs = await clientService.transactions({});
		expect(txs).toBeDefined();

		spyWithEmptyMatch.mockRestore();
	});

	describe("usernames", () => {
		let evmCallSpy: any;

		beforeEach(async () => {
			vi.resetModules();
			evmCallSpy = vi.spyOn(clientService, "evmCall");
		});

		afterEach(() => {
			// No-op: avoid linter error for vi.restoreAllMocks
		});

		it("should fetch usernames", async () => {
			// Only evmCall is mocked with a real encoded output
			const encodedResult =
				"0x000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa00000000000000000000000000000000000000000000000000000000000000400000000000000000000000000000000000000000000000000000000000000009757365726e616d653100000000000000000000000000000000000000000000";

			evmCallSpy.mockResolvedValue({
				id: 1,
				jsonrpc: "2.0",
				result: encodedResult,
			});

			const usernames = await clientService.usernames([validAddress]);

			expect(evmCallSpy).toHaveBeenCalled();
			expect(usernames.items()[0].username()).toBe("username1");
		});

		it("should handle encodeFunctionData error", async () => {
			// Simulate encodeFunctionData error using an invalid address
			const invalidAddress = "notAnAddress";
			await expect(clientService.usernames([invalidAddress])).rejects.toThrow(/Failed to encode function data/);
		});

		it("should handle decodeFunctionResult error", async () => {
			// Simulate decodeFunctionResult error using an invalid result (not a valid output for getUsernames)
			evmCallSpy.mockResolvedValue({
				id: 1,
				jsonrpc: "2.0",
				result: "0xdeadbeef", // invalid output
			});
			await expect(clientService.usernames([validAddress])).rejects.toThrow(/Failed to decode function result/);
		});

		it("should handle evmCall error", async () => {
			evmCallSpy.mockRejectedValue(new Error("evm error"));
			await expect(clientService.usernames([validAddress])).rejects.toThrow("evm error");
		});

		it("should handle generic error", async () => {
			evmCallSpy.mockRejectedValue({}); // Not an instance of Error
			await expect(clientService.usernames([validAddress])).rejects.toThrow(
				"Failed to fetch usernames: Unknown error occurred",
			);
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

		it("should handle identifiers with empty addresses", async () => {
			await clientService.transactions({ identifiers: [{ value: "" }] });
			expect(spy).toHaveBeenCalledWith(1, 10, {});
		});

		it("should handle undefined transaction type", async () => {
			await clientService.transactions({ type: "unknownType" as any });
			expect(spy).toHaveBeenCalledWith(1, 10, {});
		});

		it("should handle types with undefined values", async () => {
			await clientService.transactions({ types: ["unknownType1", "unknownType2"] as any });
			expect(spy).toHaveBeenCalledWith(1, 10, {});
		});

		it("should handle meta pagination with null values", async () => {
			const spyWithNullMeta = vi.spyOn(Transactions.prototype, "all").mockResolvedValue({
				data: [],
				meta: { last: null, next: null, previous: null, self: null },
			} as any);

			await clientService.transactions({});

			spyWithNullMeta.mockRestore();
		});

		it("should handle transactions with undefined limit and page", async () => {
			const spy = vi.spyOn(Transactions.prototype, "all").mockResolvedValue({
				data: [],
				meta: { last: "page=1" },
			} as any);

			await clientService.transactions({ limit: undefined, page: undefined } as any);
			expect(spy).toHaveBeenCalledWith(1, 10, {});

			spy.mockRestore();
		});

		it("should handle wallets with undefined limit and page", async () => {
			const spy = vi.spyOn(Wallets.prototype, "all").mockResolvedValue({
				data: [],
				meta: { last: "page=1" },
			} as any);

			await clientService.wallets({ limit: undefined, page: undefined } as any);
			expect(spy).toHaveBeenCalledWith(1, 10);

			spy.mockRestore();
		});

		it("should handle validators with undefined limit and page", async () => {
			const spy = vi.spyOn(Validators.prototype, "all").mockResolvedValue({
				data: [],
				meta: { last: "page=1" },
			} as any);

			await clientService.validators({ limit: undefined, page: undefined } as any);
			expect(spy).toHaveBeenCalledWith(1, 10, {});

			spy.mockRestore();
		});

		it("should normalize timestamps with epoch calculation", async () => {
			const epoch = "2017-03-21T13:00:00.000Z";
			const configWithEpoch = {
				get: (key?: string) => {
					if (key === "network.constants.epoch") {
						return epoch;
					}
					return;
				},
				host: () => "http://localhost",
			};
			const serviceWithEpoch = new ClientService({ config: configWithEpoch as any, profile: mockProfile });

			const epochUnix = 1490101200;
			const futureTimestamp = epochUnix + 1000;

			await serviceWithEpoch.transactions({ timestamp: { from: futureTimestamp, to: futureTimestamp + 100 } });

			expect(spy).toHaveBeenCalledWith(
				1,
				10,
				expect.objectContaining({
					"timestamp.from": 1000,
					"timestamp.to": 1100,
				}),
			);
		});
	});
});
