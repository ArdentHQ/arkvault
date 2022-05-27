import { Middleware } from "./router.types";
import { PreloadMiddleware } from "@/router/PreloadMiddleware";
import { UrlValidationMiddleware } from "@/router/UrlValidationMiddleware";
import { WalletMiddleware } from "@/domains/wallet/middleware";

export const middlewares: Middleware[] = [
	new UrlValidationMiddleware(),
	new PreloadMiddleware(),
	new WalletMiddleware(),
];
