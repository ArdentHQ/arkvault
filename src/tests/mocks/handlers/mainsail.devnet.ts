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
	{ path: "/node/syncing", data: require("../../fixtures/coins/mainsail/devnet/syncing.json") },
	{ path: "/transactions/fees", data: require("../../fixtures/coins/mainsail/devnet/transaction-fees.json") },
];

const wallets = ["DHBDV6VHRBaFWaEAkmBNMfp4ANKHrkpPKf"];

export const mainsailDevnetHandlers = [
	...endpoints.map((endpoint) =>
		rest.get(`https://dwallets.mainsailhq.com/api${endpoint.path}`, (_, response, context) => {
			return response(context.status(200), context.json(endpoint.data));
		}),
	),
	rest.get("https://dwallets.mainsailhq.com/", (_, response, context) => {
		return response(context.status(200), context.json({ data: "Hello World!" }));
	}),
	rest.get("https://dwallets.mainsailhq.com/api/wallets/:identifier", (request, response, context) => {
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
