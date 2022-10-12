import type { ResponseComposition, DefaultBodyType, RestContext } from "msw";
import { rest } from "msw";
import { setupServer } from "msw/node";

import { cryptoCompareHandlers, devnetHandlers, exchangeHandlers, mainnetHandlers, miscHandlers } from "./handlers";

export const requestMock = (path: string, data: undefined | string | object, options = {}) => {
	const requestOptions = {
		method: "get",
		status: 200,
		modifier: undefined,
		...options,
	};

	return rest[requestOptions.method](
		path,
		(_: any, response: ResponseComposition<DefaultBodyType>, context: RestContext) => {
			if (typeof data === "function") {
				throw new Error(`Mock request using "rest.${requestOptions.method}()"`);
			}

			if (requestOptions.modifier) {
				// @ts-ignore
				return response[requestOptions.modifier](context.status(requestOptions.status), context.json(data));
			}

			return response(context.status(requestOptions.status), context.json(data));
		},
	);
};

export const requestMockOnce = (path: string, data: undefined | string | object, options = {}) =>
	requestMock(path, data, { ...options, modifier: "once" });

const restHandlers = [
	...cryptoCompareHandlers,
	...devnetHandlers,
	...exchangeHandlers,
	...mainnetHandlers,
	...miscHandlers,
];

export const server = setupServer(...restHandlers);
