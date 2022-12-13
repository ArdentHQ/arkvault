import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Migration = preloadLazy(() => import("./pages/Migration"));

export const MigrationRoutes: RouteItem[] = [
	{
		component: Migration,
		exact: true,
		path: ProfilePaths.Migration,
	},
];
