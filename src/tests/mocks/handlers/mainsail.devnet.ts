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
	{ path: "/delegates", data: require("../../fixtures/coins/mainsail/devnet/delegates.json") },
	{ path: "/node/syncing", data: require("../../fixtures/coins/mainsail/devnet/syncing.json") },
	// { path: "/transactions/fees", data: require("../../fixtures/coins/mainsail/devnet/transaction-fees.json") },
];

const wallets = ["0xcd15953dD076e56Dc6a5bc46Da23308Ff3158EE6"];

export const mainsailDevnetHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://dwallets-evm.mainsailhq.com/api${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data);
		}),
	),
	http.get("https://dwallets-evm.mainsailhq.com/", () => {
		return HttpResponse.json({ data: "Hello World!" });
	}),
	http.get("https://raw.githubusercontent.com/ArkEcosystem/common/master/mainsail/devnet/known-wallets-extended.json", () => {
		return HttpResponse.json([
			{
				"type": "team",
				"name": "Genesis 1",
				"address": "0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466"
			},
			{
				"type": "team",
				"name": "Genesis 2",
				"address": "0x12361f0Bd5f95C3Ea8BF34af48F5484b811B5CCe"
			},
			{
				"type": "exchange",
				"name": "Some Exchange",
				"address": "0xA5cc0BfEB09742C5e4C610f2EBaaB82Eb142Ca10"
			}
		]);
	}),
	http.post("https://dwallets-evm.mainsailhq.com/evm/api", async ({ request }) => {
		const body = await request.json();

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
		const address = new URL(request.url).pathname.split("/").pop();

		if (!address) {
			return HttpResponse.json(require("../../fixtures/coins/ark/mainnet/wallets/not-found.json"));
		}

		if (wallets.includes(address)) {
			return HttpResponse.json(require(`../../fixtures/coins/ark/devnet/wallets/${address}.json`));
		}

		return HttpResponse.json(require("../../fixtures/coins/ark/devnet/wallets/not-found.json"));
	}),
];
