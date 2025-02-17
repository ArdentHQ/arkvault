import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const ImportWallet = preloadLazy(() => import("./pages/ImportWallet"));
const WalletGroupPage = preloadLazy(
	() => import("./pages/WalletGroupPage") as Promise<{ default: ComponentType<unknown> }>,
);

export const WalletRoutes: RouteItem[] = [

	{
		component: ImportWallet,
		exact: true,
		path: ProfilePaths.ImportWalletLedger,
	},
	{
		component: ImportWallet,
		exact: true,
		path: ProfilePaths.ImportWallet,
	},
	{
		component: WalletGroupPage,
		exact: true,
		path: ProfilePaths.WalletGroupPage,
	},
];
