import { ComponentType } from "react";

import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const Contacts = preloadLazy(() => import("./pages/Contacts") as Promise<{ default: ComponentType<unknown> }>);

export const ContactRoutes: RouteItem[] = [
	{
		component: Contacts,
		exact: true,
		path: ProfilePaths.Contacts,
	},
];
