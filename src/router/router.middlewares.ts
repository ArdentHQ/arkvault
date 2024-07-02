import { WalletMiddleware } from "@/domains/wallet/middleware";
import { PreloadMiddleware } from "@/router/PreloadMiddleware";
import { UrlValidationMiddleware } from "@/router/UrlValidationMiddleware";

import { Middleware } from "./router.types";

export const middlewares: Middleware[] = [
	new UrlValidationMiddleware(),
	new PreloadMiddleware(),
	new WalletMiddleware(),
];
