import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const News = preloadLazy(() => import("./pages/News"));

export const NewsRoutes: RouteItem[] = [
	{
		component: News,
		exact: true,
		path: ProfilePaths.News,
	},
];
