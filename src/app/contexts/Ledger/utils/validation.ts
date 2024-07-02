import { Coins } from "@ardenthq/sdk";
import semver from "semver";

import { minVersionList } from "@/app/contexts/Ledger/Ledger.contracts";

export const hasRequiredAppVersion = async (coin: Coins.Coin) => {
	const coinId = coin.network().coin();

	if (minVersionList[coinId]) {
		const currentVersion = await coin.ledger().getVersion();

		if (semver.lt(currentVersion, minVersionList[coinId])) {
			return false;
		}
	}

	return true;
};
