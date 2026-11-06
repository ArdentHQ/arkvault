import { Contracts } from "@/app/lib/profiles";
import { PlatformSdkChoices } from "@/data";

interface MigrationContext {
	data: Contracts.IProfileData;
	profile: Contracts.IProfile;
}

const isSupportedByArkPricing = (currency?: string): boolean => {
	const arkPricing = PlatformSdkChoices.marketProviders.find(({ value }) => value === "arkpricing");

	return !arkPricing?.unsupportedCurrencies.includes(`${currency}`.toUpperCase());
};

export const profileMigrations = {
	"1.18.0": ({ data }: MigrationContext): void => {
		const currency = data.settings[Contracts.ProfileSetting.ExchangeCurrency] as string | undefined;

		data.settings[Contracts.ProfileSetting.MarketProvider] = isSupportedByArkPricing(currency)
			? "arkpricing"
			: "coingecko";
	},
};
