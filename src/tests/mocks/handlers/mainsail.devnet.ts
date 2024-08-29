import { rest } from "msw";

const endpoints = [
	{ path: "/blockchain", data: require("../../fixtures/coins/mainsail/devnet/blockchain.json") },
	{ path: "/node/configuration", data: require("../../fixtures/coins/mainsail/devnet/configuration.json") },
	{ path: "/node/fees", data: require("../../fixtures/coins/mainsail/devnet/node-fees.json") },
	{ path: "/peers", data: require("../../fixtures/coins/mainsail/devnet/peers.json") },
	{
		path: "/node/configuration/crypto",
		data: require("../../fixtures/coins/mainsail/devnet/cryptoConfiguration.json"),
	},
	{ path: "/delegates", data: require("../../fixtures/coins/mainsail/devnet/delegates.json") },
	{ path: "/node/syncing", data: require("../../fixtures/coins/mainsail/devnet/syncing.json") },
	{ path: "/transactions/fees", data: require("../../fixtures/coins/mainsail/devnet/transaction-fees.json") },
];

const wallets = [
	"0xdE983E8d323d045fde918B535eA43e1672a9B4ea",
	"0xfEAf2f24ba1205e9255d015DFaD8463c70D9A466",
	"0xC46C85b3Dc856cdD23ac864a38be2E12090e7715",
	"0x57Dc55AED392F634d6bea6E6A89718de7f5fA7e0",
];

export const mainsailDevnetHandlers = [
	...endpoints.map((endpoint) =>
		rest.get(`https://dwallets-evm.mainsailhq.com/api${endpoint.path}`, (_, response, context) => {
			return response(context.status(200), context.json(endpoint.data));
		}),
	),
	rest.get("https://dwallets-evm.mainsailhq.com/", (_, response, context) => {
		return response(context.status(200), context.json({ data: "Hello World!" }));
	}),
	rest.get("https://dwallets-evm.mainsailhq.com/api/wallets/:identifier", (request, response, context) => {
		const identifier = request.params.identifier as string;

		if (wallets.includes(identifier)) {
			return response(
				context.status(200),
				context.json(require(`../../fixtures/coins/mainsail/devnet/wallets/${identifier}.json`)),
			);
		}

		return response(
			context.status(200),
			context.json(require("../../fixtures/coins/mainsail/devnet/wallets/not-found.json")),
		);
	}),
];
