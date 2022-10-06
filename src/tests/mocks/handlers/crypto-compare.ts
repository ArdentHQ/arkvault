import { rest } from "msw";

const endpoints = [
  { path: "/data/dayAvg?fsym=DARK&tsym=BTC&toTs=1593561600", data: require("../tests/fixtures/exchange/cryptocompare.json") },
  { path: "/data/dayAvg?fsym=ARK&tsym=BTC&toTs=1593561600", data: require("../tests/fixtures/exchange/cryptocompare.json") },
  { path: "/data/histoday", data: require("../tests/fixtures/exchange/cryptocompare-historical.json") },
];

export const exchangeHandlers = [
  ...endpoints.map((endpoint) =>
    rest.get(`https://min-api.cryptocompare.com${endpoint.path}`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json(endpoint.data));
    }),
  ),
];
