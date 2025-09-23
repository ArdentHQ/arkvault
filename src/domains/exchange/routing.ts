import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Exchange = preloadLazy(() => import("./pages/Exchange"));

export const ExchangeRoutes: RouteItem[] = [
	{
		component: Exchange,
		exact: true,
		path: ProfilePaths.Exchange,
	},
];
