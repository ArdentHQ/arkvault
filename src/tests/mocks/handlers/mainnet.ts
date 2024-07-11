import { http, HttpResponse } from "msw";

const endpoints = [
	{ path: "/blockchain", data: require("../../fixtures/coins/ark/mainnet/blockchain.json") },
	{ path: "/delegates", data: require("../../fixtures/coins/ark/mainnet/delegates.json") },
	{ path: "/peers", data: require("../../fixtures/coins/ark/mainnet/peers.json") },
	{ path: "/node/configuration", data: require("../../fixtures/coins/ark/mainnet/configuration.json") },
	{ path: "/node/configuration/crypto", data: require("../../fixtures/coins/ark/mainnet/cryptoConfiguration.json") },
	{ path: "/node/syncing", data: require("../../fixtures/coins/ark/mainnet/syncing.json") },
	{ path: "/transactions", data: require("../../fixtures/coins/ark/mainnet/transactions.json") },
	{ path: "/wallets", data: require("../../fixtures/coins/ark/mainnet/wallets.json") },
];

const wallets = ["AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX"];

export const mainnetHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://ark-live.arkvault.io/api${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data)
		}),
	),
	http.get("https://ark-live.arkvault.io/", () => {
		return HttpResponse.json({ data: "Hello World!" })
	}),
	http.get(
		"https://raw.githubusercontent.com/ArkEcosystem/common/master/mainnet/known-wallets-extended.json",
		() => {
			return HttpResponse.json([])
		},
	),
	http.get("https://ark-live.arkvault.io/api/wallets/:identifier", ({ request }) => {
		const url = new URL(request.url)
		const identifier: string = url.searchParams.get("identifier") ?? ""
		console.log({ identifier })

		if (wallets.includes(identifier)) {
			return HttpResponse.json(require(`../../fixtures/coins/ark/mainnet/wallets/${identifier}.json`))
		}

		return HttpResponse.json(require("../../fixtures/coins/ark/mainnet/wallets/not-found.json"))
	}),
];
