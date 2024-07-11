import { http, HttpResponse } from "msw";

const endpoints = [
	{ path: "", data: require("../../fixtures/exchange/exchanges.json") },
	{ path: "/:provider/currencies", data: require("../../fixtures/exchange/changenow/currencies.json") },
	{ path: "/:provider/currencies/ark", data: require("../../fixtures/exchange/changenow/currency-ark.json") },
	{ path: "/:provider/currencies/ark/payoutAddress", data: { data: true } },
	{ path: "/:provider/currencies/btc", data: require("../../fixtures/exchange/changenow/currency-btc.json") },
	{
		path: "/:provider/currencies/btc/:address",
		data: require("../../fixtures/exchange/changenow/validate-address.json"),
	},
	{ path: "/:provider/tickers/:from/:to", data: require("../../fixtures/exchange/changenow/minimum.json") },
	{ path: "/:provider/tickers/:from/:to/1", data: require("../../fixtures/exchange/changenow/estimate.json") },
	{ path: "/:provider/orders/id", data: { data: { id: "id", status: "finished" } } },
];

export const exchangeHandlers = [
	...endpoints.map((endpoint) =>
		http.get(`https://exchanges.arkvault.io/api${endpoint.path}`, () => {
			return HttpResponse.json(endpoint.data)
		}),
	),
	http.post("https://exchanges.arkvault.io/api/:provider/orders", (_, response, context) => {
		return HttpResponse.json(require("../../fixtures/exchange/changenow/order.json"))
	}),
];
