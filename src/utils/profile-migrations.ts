import { Contracts } from "@/app/lib/profiles";

interface MigrationContext {
	data: Contracts.IProfileData;
	profile: Contracts.IProfile;
}

export const profileMigrations = {
	"1.18.0": ({ data }: MigrationContext): void => {
		data.settings[Contracts.ProfileSetting.MarketProvider] = "arkpricing";
	},
};
