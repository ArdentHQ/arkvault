import { ContactRoutes } from "@/domains/contact/routing";
import { DashboardRoutes } from "@/domains/dashboard/routing";
import { ExchangeRoutes } from "@/domains/exchange/routing";
import { MessageRoutes } from "@/domains/message/routing";
import { MigrationRoutes } from "@/domains/migration/routing";
import { SettingRoutes } from "@/domains/setting/routing";
import { TransactionRoutes } from "@/domains/transaction/routing";
import { VoteRoutes } from "@/domains/vote/routing";
import { WalletRoutes } from "@/domains/wallet/routing";
import { ProfileRoutes } from "@/domains/profile/routing";
import { RouteItem } from "@/router/router.types";

export const routes: RouteItem[] = [
	...ContactRoutes,
	...DashboardRoutes,
	...ExchangeRoutes,
	...MessageRoutes,
	...MigrationRoutes,
	,
	...SettingRoutes,
	...TransactionRoutes,
	...VoteRoutes,
	...WalletRoutes,
	...ProfileRoutes,
];
