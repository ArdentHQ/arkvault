import { Contracts } from "@ardenthq/sdk-profiles";

import { DEFAULT_MARKET_PROVIDER } from "@/domains/profile/data";

export const updateMarketProvider = ({ profile }) => {
	profile.settings().set(Contracts.ProfileSetting.MarketProvider, DEFAULT_MARKET_PROVIDER);
};
