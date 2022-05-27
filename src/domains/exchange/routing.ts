import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const ExchangeView = preloadLazy(() => import("./pages/ExchangeView"));
const Exchange = preloadLazy(() => import("./pages/Exchange"));

export const ExchangeRoutes: RouteItem[] = [
	{
		component: ExchangeView,
		exact: true,
		path: ProfilePaths.ExchangeView,
	},
	{
		component: Exchange,
		exact: true,
		path: ProfilePaths.Exchange,
	},
];
