import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const SignMessage = preloadLazy(() => import("./pages/SignMessage"));
const VerifyMessage = preloadLazy(() => import("./pages/VerifyMessage"));

export const MessageRoutes: RouteItem[] = [
	{
		component: SignMessage,
		exact: true,
		path: ProfilePaths.SignMessageWallet,
	},
	{
		component: SignMessage,
		exact: true,
		path: ProfilePaths.SignMessage,
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
