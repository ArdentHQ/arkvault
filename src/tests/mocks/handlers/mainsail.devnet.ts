import { http, HttpResponse, rest } from "msw";

const endpoints = [
	{ path: "/blockchain", data: require("../../fixtures/coins/mainsail/devnet/blockchain.json") },
	{ path: "/node/configuration", data: require("../../fixtures/coins/mainsail/devnet/configuration.json") },
	{ path: "/node/fees", data: require("../../fixtures/coins/mainsail/devnet/node-fees.json") },
	{ path: "/peers", data: require("../../fixtures/coins/mainsail/devnet/peers.json") },
	{
		path: "/node/configuration/crypto",
		data: require("../../fixtures/coins/mainsail/devnet/cryptoConfiguration.json"),
	},
	{ path: "/transactions", data: require("../../fixtures/coins/mainsail/devnet/transactions.json") },
	{ path: "/validators", data: require("../../fixtures/coins/mainsail/devnet/validators.json") },
	{ path: "/node/syncing", data: require("../../fixtures/coins/mainsail/devnet/syncing.json") },
	// { path: "/transactions/fees", data: require("../../fixtures/coins/mainsail/devnet/transaction-fees.json") },
];

const wallets = [
	"0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6",
	"0x659A76be283644AEc2003aa8ba26485047fd1BFB",
	"0x125b484e51Ad990b5b3140931f3BD8eAee85Db23",
	"0xfb36D3cc82953351A7f9a0Fd09c17D271ecBEB03", // abc
	"0xA46720D11Bc8408411Cbd45057EeDA6d32D2Af54",
	"0xB64b3619cEF2642E36B6093da95BA2D14Fa9b52f", // cold wallet
];

export const mainsailDevnetHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://dwallets-evm.mainsailhq.com/api${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data);
		}),
	),
	// Special handler for unconfirmed transactions with query parameters
	http.get("https://dwallets-evm.mainsailhq.com/tx/api/transactions/unconfirmed", () => {
		return HttpResponse.json({ data: [] });
	}),
	http.get("https://dwallets-evm.mainsailhq.com/", () => {
		return HttpResponse.json({ data: "Hello World!" });
	}),
	http.get(
		"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extended.json",
		() => {
			return HttpResponse.json([
				{
					type: "team",
					name: "Genesis 1",
					address: "0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466",
				},
				{
					type: "team",
					name: "Genesis 2",
					address: "0x12361f0Bd5f95C3Ea8BF34af48F5484b811B5CCe",
				},
				{
					type: "exchange",
					name: "Some Exchange",
					address: "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10",
				},
			]);
		},
	),
	http.post("https://dwallets-evm.mainsailhq.com/evm/api", async ({ request }) => {
		const body = await request.json();

		if (body.method === "eth_estimateGas") {
			return HttpResponse.json({
				id: 1,
				jsonrpc: "2.0",
				result: "0x5208",
			});
		}

		// if `to` is `username` abi
		if (body.params[0].to === "0x2c1DE3b4Dbb4aDebEbB5dcECAe825bE2a9fc6eb6") {
			return HttpResponse.json({
				id: 1,
				jsonrpc: "2.0",
				result: "0x00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000c000000000000000000000000093485b57ff3ded81430d08579142fae8234c6a170000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000000673686168696e0000000000000000000000000000000000000000000000000000000000000000000000000000cd15953dd076e56dc6a5bc46da23308ff3158ee6000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000127661756c745f746573745f616464726573730000000000000000000000000000",
			});
		}

		return HttpResponse.json({
			id: 1,
			jsonrpc: "2.0",
			result: "0x0",
		});
	}),

	http.get("https://dwallets-evm.mainsailhq.com/api/wallets/:identifier", (request) => {
		const address = request.params.identifier as string;

		if (!address) {
			return HttpResponse.json(require("../../fixtures/coins/mainsail/mainnet/wallets/not-found.json"));
		}

		if (wallets.includes(address)) {
			return HttpResponse.json(require(`../../fixtures/coins/mainsail/devnet/wallets/${address}.json`));
		}

		return HttpResponse.json(require("../../fixtures/coins/mainsail/devnet/wallets/not-found.json"));
	}),

	http.get("https://dwallets-evm.mainsailhq.com/api/wallets/:identifier/tokens", (request) => {
		const address = request.params.identifier as string;

		if (!address) {
			return HttpResponse.json(require("../../fixtures/coins/mainsail/mainnet/wallets/not-found.json"));
		}

		return HttpResponse.json({
			meta: {
				totalCountIsEstimate: false,
				count: 48,
				first: "/peers?limit=100&page=1",
				last: "/peers?limit=100&page=1",
				next: null,
				pageCount: 1,
				previous: null,
				self: "/peers?limit=100&page=1",
				totalCount: 48,
			},
			data: [],
		});
	}),
];
