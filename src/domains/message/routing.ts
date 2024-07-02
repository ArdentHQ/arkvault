import { ComponentType } from "react";

import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const SignMessage = preloadLazy(() => import("./pages/SignMessage") as Promise<{ default: ComponentType<unknown> }>);
const VerifyMessage = preloadLazy(
	() => import("./pages/VerifyMessage") as Promise<{ default: ComponentType<unknown> }>,
);

export const MessageRoutes: RouteItem[] = [
	{
		component: SignMessage,
		exact: true,
		path: ProfilePaths.SignMessage,
	},
	{
		component: SignMessage,
		exact: true,
		path: ProfilePaths.SignMessageWallet,
	},
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
