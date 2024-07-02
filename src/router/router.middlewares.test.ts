import { WalletMiddleware } from "@/domains/wallet/middleware";

import { PreloadMiddleware } from "./PreloadMiddleware";
import { middlewares } from "./router.middlewares";
import { UrlValidationMiddleware } from "./UrlValidationMiddleware";

describe("Router middlewares", () => {
	it("should have PreloadMiddleware and WalletMiddleware", () => {
		expect(middlewares).toHaveLength(3);
		expect(middlewares[0]).toBeInstanceOf(UrlValidationMiddleware);
		expect(middlewares[1]).toBeInstanceOf(PreloadMiddleware);
		expect(middlewares[2]).toBeInstanceOf(WalletMiddleware);
	});
});
