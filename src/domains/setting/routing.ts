import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const General = preloadLazy(() => import("./pages/General") as Promise<{ default: ComponentType<unknown> }>);
const Password = preloadLazy(() => import("./pages/Password"));
const Export = preloadLazy(() => import("./pages/Export"));
const Servers = preloadLazy(() => import("./pages/Servers"));

export const SettingRoutes: RouteItem[] = [
	{
		component: General,
		exact: true,
		path: ProfilePaths.GeneralSettings,
	},
	{
		component: Password,
		exact: true,
		path: ProfilePaths.PasswordSettings,
	},
	{
		component: Export,
		exact: true,
		path: ProfilePaths.ExportSettings,
	},
	{
		component: General,
		exact: true,
		path: ProfilePaths.Settings,
	},
	{
		component: Servers,
		exact: true,
		path: ProfilePaths.ServerManagmentSettings,
	},
];
