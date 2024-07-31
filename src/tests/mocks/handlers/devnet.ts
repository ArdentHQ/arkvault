import { http, HttpResponse } from "msw";

import delegate from "@/tests/fixtures/coins/ark/devnet/wallets/D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib.json";

const endpoints = [
	{ path: "/blockchain", data: require("../../fixtures/coins/ark/devnet/blockchain.json") },
	{ path: "/node/configuration", data: require("../../fixtures/coins/ark/devnet/configuration.json") },
	{ path: "/node/fees", data: require("../../fixtures/coins/ark/devnet/node-fees.json") },
	{ path: "/peers", data: require("../../fixtures/coins/ark/devnet/peers.json") },
	{ path: "/node/configuration/crypto", data: require("../../fixtures/coins/ark/devnet/cryptoConfiguration.json") },
	{ path: "/node/syncing", data: require("../../fixtures/coins/ark/devnet/syncing.json") },
	{ path: "/delegates", data: require("../../fixtures/coins/ark/devnet/delegates.json") },
	{ path: "/delegates/:identifier", data: delegate },
	{ path: "/transactions", data: require("../../fixtures/coins/ark/devnet/transactions.json") },
	{ path: "/transactions/fees", data: require("../../fixtures/coins/ark/devnet/transaction-fees.json") },
	{ path: "/wallets", data: require("../../fixtures/coins/ark/devnet/wallets.json") },
	{
		path: "/wallets/D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD/votes",
		data: require("../../fixtures/coins/ark/devnet/votes.json"),
	},
];

const wallets = [
	"D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb",
	"DABCrsfEqhtdzmBrE2AU5NNmdUFCGXKEkr",
	"DNTwQTSp999ezQ425utBsWetcmzDuCn2pN",
	"DJXg9Vqg2tofRNrMAvMzhZTkegu8QyyNQq",
	"D61mfSggzbvQgTUe6JhYKH2doHaqJ3Dyib",
	"D8rr7B1d6TL6pf14LgMz4sKp1VBMs6YUYD",
	"DFJ5Z51F1euNNdRUQJKQVdG4h495LZkc6T",
	"DKrACQw7ytoU2gjppy3qKeE2dQhZjfXYqu",
	"D9YiyRYMBS2ofzqkufjrkB9nHofWgJLM7f",
	"DC8ghUdhS8w8d11K8cFQ37YsLBFhL3Dq2P",
];

export const devnetHandlers = [
	...endpoints.map((endpoint) => {
		return http.get(`https://ark-test.arkvault.io/api${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data);
		});
	}),
	http.get("https://ark-test.arkvault.io/", () => {
		return HttpResponse.json({ data: "Hello World!" });
	}),
	http.get("https://raw.githubusercontent.com/ArkEcosystem/common/master/devnet/known-wallets-extended.json", () => {
		return HttpResponse.json([]);
	}),
	http.get("https://ark-test.arkvault.io/api/wallets/:identifier", (request, response, context) => {
		const identifier = request.params.identifier as string;

		if (wallets.includes(identifier)) {
			return HttpResponse.json(require(`../../fixtures/coins/ark/devnet/wallets/${identifier}.json`));
		}

		if (identifier === "034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192") {
			return HttpResponse.json(delegate);
		}

		return HttpResponse.json(require("../../fixtures/coins/ark/devnet/wallets/not-found.json"));
	}),
];
