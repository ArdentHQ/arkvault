import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Tokens = preloadLazy(() => import("./pages/Tokens") as Promise<{ default: ComponentType<unknown> }>);

export const TokenRoutes: RouteItem[] = [
	{
		component: Tokens,
		exact: true,
		path: ProfilePaths.Tokens,
	},
];
