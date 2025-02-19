import { ProfilePaths } from "@/router/paths";
import { RouteItem } from "@/router/router.types";
import preloadLazy from "@/utils/preload-lazy";

const ImportWallet = preloadLazy(() => import("../portfolio/components/ImportWallet"));

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
];
