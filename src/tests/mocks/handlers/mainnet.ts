import { rest } from "msw";

const endpoints = [
  // { path: "/blockchain", data: require("../../fixtures/coins/ark/devnet/blockchain.json") },
  { path: "/node/configuration", data: require("../../fixtures/coins/ark/mainnet/configuration.json") },
  { path: "/peers", data: require("../../fixtures/coins/ark/mainnet/peers.json") },
  { path: "/node/configuration/crypto", data: require("../../fixtures/coins/ark/mainnet/cryptoConfiguration.json") },
  { path: "/node/syncing", data: require("../../fixtures/coins/ark/mainnet/syncing.json") },
];

const wallets = [
  "AdVSe37niA3uFUPgCgMUH2tMsHF4LpLoiX",
];

export const mainnetHandlers = [
  ...endpoints.map((endpoint) =>
    rest.get(`https://ark-live.arkvault.io/api${endpoint.path}`, (_, response, context) => {
      return response(context.status(200), context.json(endpoint.data));
    })
  ),
  rest.get("https://ark-live.arkvault.io/api/wallets/:identifier", (_, response, context) => {
    const identifier = req.params.identifier as string;

    if (wallets.includes(identifier)) {
      return response(context.status(200), context.json(require(`../../fixtures/coins/ark/mainnet/wallets/${identifier}.json`)));
    }

    return response(context.status(200), context.json(require("../../fixtures/coins/ark/mainnet/wallets/not-found.json")));
  }),
];
