import { ComponentType } from "react";
import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const CreateWallet = preloadLazy(() => import("./pages/CreateWallet"));
const ImportWallet = preloadLazy(() => import("./pages/ImportWallet"));
const WalletDetails = preloadLazy(() => import("./pages/WalletDetails"));
const WalletGroupPage = preloadLazy(
	() => import("./pages/WalletGroupPage") as Promise<{ default: ComponentType<unknown> }>,
);

export const WalletRoutes: RouteItem[] = [
	{
		component: CreateWallet,
		exact: true,
		path: ProfilePaths.CreateWallet,
	},
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
		component: WalletDetails,
		exact: true,
		path: ProfilePaths.WalletDetails,
	},
	{
		component: WalletGroupPage,
		exact: true,
		path: ProfilePaths.WalletGroupPage,
	},
];
