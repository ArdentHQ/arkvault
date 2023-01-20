import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Migration = preloadLazy(() => import("./pages/Migration"));
const MigrationAdd = preloadLazy(() => import("./pages/MigrationAdd"));
const MigrationDetails = preloadLazy(() => import("./pages/MigrationDetails"));

export const MigrationRoutes: RouteItem[] = [
	{
		component: Migration,
		exact: true,
		path: ProfilePaths.Migration,
	},
	{
		component: MigrationAdd,
		exact: true,
		path: ProfilePaths.MigrationAdd,
	},
	{
		component: MigrationDetails,
		exact: true,
		path: ProfilePaths.MigrationDetails,
	},
];
