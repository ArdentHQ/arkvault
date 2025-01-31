import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Portfolio = preloadLazy(() => import("./pages/Portfolio") as Promise<{ default: ComponentType<unknown> }>);

export const PortfolioRoutes: RouteItem[] = [
	{
		component: Portfolio,
		exact: true,
		path: ProfilePaths.Dashboard,
	},
];
