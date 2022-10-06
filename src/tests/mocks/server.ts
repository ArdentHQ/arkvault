import { setupServer } from "msw/node";

import { devnetHandlers, exchangeHandlers, mainnetHandlers } from "./handlers";

const restHandlers = [...devnetHandlers, ...exchangeHandlers, ...mainnetHandlers];

export const server = setupServer(...restHandlers);
