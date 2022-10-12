import { rest } from "msw";

const endpoints = [
	{ path: "/data/dayAvg", data: require("../../fixtures/exchange/cryptocompare.json") },
	{ path: "/data/histoday", data: require("../../fixtures/exchange/cryptocompare-historical.json") },
];

export const cryptoCompareHandlers = [
	...endpoints.map((endpoint) =>
		rest.get(`https://min-api.cryptocompare.com${endpoint.path}`, (_, response, context) => {
			return response(context.status(200), context.json(endpoint.data));
		}),
	),
];
