import { http, HttpResponse } from "msw";

const endpoints = [
	{ path: "/data/dayAvg", data: require("../../fixtures/exchange/cryptocompare.json") },
	{ path: "/data/histoday", data: require("../../fixtures/exchange/cryptocompare-historical.json") },
];

export const cryptoCompareHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://min-api.cryptocompare.com${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data)
		}),
	),
];
