import { Contracts } from "@ardenthq/sdk-profiles";
import { isCustomNetwork } from "@/utils/network-utils";

export const sortWallets = (wallets: Contracts.IReadWriteWallet[]) =>
	wallets.sort(
		(a, b) =>
			Number(isCustomNetwork(a.network())) - Number(isCustomNetwork(b.network())) ||
			a.network().coinName().localeCompare(b.network().coinName()) ||
			Number(a.network().isTest()) - Number(b.network().isTest()) ||
			Number(b.isStarred()) - Number(a.isStarred()) ||
			(a.alias() ?? "").localeCompare(b.alias() ?? ""),
	);
