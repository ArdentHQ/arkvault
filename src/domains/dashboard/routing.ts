import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Dashboard = preloadLazy(() => import("./pages/Dashboard") as Promise<{ default: ComponentType<unknown> }>);

export const DashboardRoutes: RouteItem[] = [
	{
		component: Dashboard,
		exact: true,
		path: ProfilePaths.Dashboard,
	},
];
