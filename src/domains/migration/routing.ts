import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Migration = preloadLazy(() => import("./pages/Migration"));
const MigrationAdd = preloadLazy(() => import("./pages/MigrationAdd"));
const MigrationOverview = preloadLazy(() => import("./pages/MigrationOverview"));

export const MigrationRoutes: RouteItem[] = [
	{
		component: Migration,
		exact: true,
		path: ProfilePaths.Migration,
	},
	{
		component: MigrationOverview,
		exact: true,
		path: ProfilePaths.MigrationOverview,
	},
	{
		component: MigrationAdd,
		exact: true,
		path: ProfilePaths.MigrationAdd,
	},
];
