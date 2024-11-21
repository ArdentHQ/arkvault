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
	// { path: "/delegates", data: require("../../fixtures/coins/mainsail/devnet/delegates.json") },
	{ path: "/node/syncing", data: require("../../fixtures/coins/mainsail/devnet/syncing.json") },
	// { path: "/transactions/fees", data: require("../../fixtures/coins/mainsail/devnet/transaction-fees.json") },
];

const wallets = ["0x8A3117649655714c296cd816691e01C5148922ed"];

export const mainsailDevnetHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://dwallets-evm.mainsailhq.com/api${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data);
		}),
	),
	http.get("https://dwallets-evm.mainsailhq.com/", () => {
		return HttpResponse.json({ data: "Hello World!" });
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
