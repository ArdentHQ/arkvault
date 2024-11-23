import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";

import {
	cryptoCompareHandlers,
	devnetHandlers,
	exchangeHandlers,
	mainnetHandlers,
	mainsailDevnetHandlers,
	miscHandlers,
} from "./handlers";

export const requestMock = (path: string, data: undefined | string | object, options = {}) => {
	const requestOptions = {
		method: "get",
		status: 200,
		modifier: undefined,
		query: undefined,
		...options,
	};

	return http[requestOptions.method](
		path,
		({ request }) => {
			if (typeof data === "function") {
				throw new Error(`Mock request using "http.${requestOptions.method}()"`);
			}

			if (requestOptions.query) {
				const url = new URL(request.url);

				for (const [name, value] of Object.entries(requestOptions.query)) {
					if (
						url.searchParams.get(name) !== (value === null || value === undefined ? null : value.toString())
					) {
						return;
					}
				}
			}

			return HttpResponse.json(data, requestOptions);
		},
		{ once: requestOptions.modifier === "once" },
	);
};

export const requestMockOnce = (path: string, data: undefined | string | object, options = {}) =>
	requestMock(path, data, { ...options, modifier: "once" });

const restHandlers = [
	...cryptoCompareHandlers,
	...devnetHandlers,
	...exchangeHandlers,
	...mainnetHandlers,
	...mainsailDevnetHandlers,
	...miscHandlers,
];

export const server = setupServer(...restHandlers);
