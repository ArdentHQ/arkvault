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
    rest.get(`https://ark-live.arkvault.io/api${endpoint.path}`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(endpoint.data));
    })
  ),
  rest.get("https://ark-live.arkvault.io/api/wallets/:identifier", (req, res, ctx) => {
    const identifier = req.params.identifier as string;

    if (wallets.includes(identifier)) {
      return res(ctx.status(200), ctx.json(require(`../../fixtures/coins/ark/mainnet/wallets/${identifier}.json`)));
    }

    return res(ctx.status(200), ctx.json(require("../../fixtures/coins/ark/mainnet/wallets/not-found.json")));
  }),
];
