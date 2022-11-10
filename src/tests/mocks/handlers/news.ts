import { rest } from "msw";

const endpoints = [];

export const newsHandlers = [
	...endpoints.map((endpoint) =>
		rest.get(`https://news.arkvault.io/api${endpoint.path}`, (_, response, context) => {
			return response(context.status(200), context.json(endpoint.data));
		}),
	),
	rest.get("https://news.arkvault.io/api", (request, response, context) => {
		const page = request.url.searchParams.get("page") as string;

		if (!!page) {
			return response(context.status(200), context.json(require(`../../fixtures/news/page-${page}.json`)));
		}

		return response(context.status(200), context.json(require("../../fixtures/news/page-1.json")));
	}),
];
