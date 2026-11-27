import { http, HttpResponse } from "msw";

const endpoints = [
	{ data: require("../../../app/lib/markets/fixtures/arkpricing/average.json"), path: "average" },
	{ data: require("../../../app/lib/markets/fixtures/arkpricing/history-day.json"), path: "history" },
	{ data: require("../../../app/lib/markets/fixtures/arkpricing/market.json"), path: "market" },
	{ data: require("../../../app/lib/markets/fixtures/arkpricing/price.json"), path: "price" },
];

export const arkPricingHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://pricing.ardenthq.com/api/v1/coins/:coin/${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data);
		}),
	),
];
