import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const CreateProfile = preloadLazy(() => import("./pages/CreateProfile"));
const ImportProfile = preloadLazy(() => import("./pages/ImportProfile"));
const Welcome = preloadLazy(() => import("./pages/Welcome"));

export const ProfileRoutes: RouteItem[] = [
	{
		component: CreateProfile,
		exact: true,
		path: ProfilePaths.CreateProfile,
	},
	{
		component: ImportProfile,
		exact: true,
		path: ProfilePaths.ImportProfile,
	},
	{
		component: Welcome,
		exact: true,
		path: ProfilePaths.Welcome,
	},
];
