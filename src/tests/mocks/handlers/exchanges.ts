import { rest } from "msw";

const endpoints = [
  { path: "", data: require("../../fixtures/exchange/exchanges.json") },
  { path: "/changenow/currencies", data: require("../../fixtures/exchange/changenow/currencies.json") },
  { path: "/changenow/currencies/ark", data: require("../../fixtures/exchange/changenow/currency-ark.json") },
  { path: "/changenow/currencies/ark/payoutAddress", data: { data: true } },
  { path: "/changenow/currencies/btc", data: require("../../fixtures/exchange/changenow/currency-btc.json") },
  { path: "/changenow/tickers/ark/btc", data: require("../../fixtures/exchange/changenow/minimum.json") },
  { path: "/changenow/tickers/btc/ark", data: require("../../fixtures/exchange/changenow/minimum.json") },
  { path: "/changenow/tickers/:from/:to/1", data: require("../../fixtures/exchange/changenow/estimate.json") },
  { path: "/changenow/orders/id", data: { data: { id: "id", status: "finished" } } },
];

export const exchangeHandlers = [
  ...endpoints.map((endpoint) =>
    rest.get(`https://exchanges.arkvault.io/api${endpoint.path}`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(endpoint.data));
    }),
  ),
];
