import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const VerifyMessage = preloadLazy(
	() => import("./pages/VerifyMessage") as Promise<{ default: ComponentType<unknown> }>,
);

export const MessageRoutes: RouteItem[] = [
	{
		component: VerifyMessage,
		exact: true,
		path: ProfilePaths.VerifyMessage,
	},
	{
		component: VerifyMessage,
		exact: true,
		path: ProfilePaths.VerifyMessageWallet,
	},
];
