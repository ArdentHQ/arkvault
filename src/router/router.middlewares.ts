import { Middleware } from "./router.types";
import { PreloadMiddleware } from "@/router/PreloadMiddleware";
import { UrlValidationMiddleware } from "@/router/UrlValidationMiddleware";

export const middlewares: Middleware[] = [
	new UrlValidationMiddleware(),
	new PreloadMiddleware(),
];
