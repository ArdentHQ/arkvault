import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Votes = preloadLazy(() => import("./pages/Votes"));

export const VoteRoutes: RouteItem[] = [
	{
		component: Votes,
		exact: true,
		path: ProfilePaths.Votes,
	},
	{
		component: Votes,
		exact: true,
		path: ProfilePaths.VotesWallet,
	},
];
