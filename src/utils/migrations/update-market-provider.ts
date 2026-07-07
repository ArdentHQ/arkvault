import { Contracts } from "@ardenthq/sdk-profiles";

import { DEFAULT_MARKET_PROVIDER } from "@/domains/profile/data";

export const updateMarketProvider = ({ data }) => {
	data.settings[Contracts.ProfileSetting.MarketProvider] = DEFAULT_MARKET_PROVIDER;
};
