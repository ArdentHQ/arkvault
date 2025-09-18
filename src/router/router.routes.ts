import { ContactRoutes } from "@/domains/contact/routing";
import { PortfolioRoutes } from "@/domains/portfolio/routing";
import { ExchangeRoutes } from "@/domains/exchange/routing";
import { MessageRoutes } from "@/domains/message/routing";
import { SettingRoutes } from "@/domains/setting/routing";
import { VoteRoutes } from "@/domains/vote/routing";
import { ProfileRoutes } from "@/domains/profile/routing";
import { RouteItem } from "@/router/router.types";

export const routes: RouteItem[] = [
	...ContactRoutes,
	...PortfolioRoutes,
	...ExchangeRoutes,
	...MessageRoutes,
	...SettingRoutes,
	...VoteRoutes,
	...ProfileRoutes,
];
