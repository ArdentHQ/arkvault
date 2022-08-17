import { Middleware, MiddlewareParameters, RouteItem } from "@/router/router.types";
import { ContactRoutes } from "@/domains/contact/routing";
import { DashboardRoutes } from "@/domains/dashboard/routing";
import { ExchangeRoutes } from "@/domains/exchange/routing";
import { MessageRoutes } from "@/domains/message/routing";
import { NewsRoutes } from "@/domains/news/routing";
import { SettingRoutes } from "@/domains/setting/routing";
import { TransactionRoutes } from "@/domains/transaction/routing";
import { VoteRoutes } from "@/domains/vote/routing";
import { WalletRoutes } from "@/domains/wallet/routing";
import { ProfileRoutes } from "@/domains/profile/routing";
import { isUnit } from "@/utils/test-helpers";

const getPreloadableRoutes = (path: string): RouteItem[] => {
	if (path === "/") {
		return [...DashboardRoutes, ...ProfileRoutes, ...SettingRoutes, ...ContactRoutes];
	}

	if (path.startsWith("/profiles")) {
		return [
			...ExchangeRoutes,
			...MessageRoutes,
			...NewsRoutes,
			...WalletRoutes,
			...TransactionRoutes,
			...VoteRoutes,
		];
	}

	return [];
};

export class PreloadMiddleware implements Middleware {
	handler({ location }: MiddlewareParameters): boolean {
		/* istanbul ignore next */
		if (isUnit()) {
			return true;
		}

		const routes = getPreloadableRoutes(location.pathname);

		if (routes.length === 0) {
			return true;
		}

		for (const route of routes) {
			route.component["preload"]?.();
		}

		return true;
	}
}
