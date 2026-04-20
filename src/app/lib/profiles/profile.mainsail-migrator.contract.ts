import { IProfile, IProfileData } from "./contracts.js";

export interface IProfileMainsailMigrator {
	/**
	 * Migrates the profile data from Mainsail to ArkVault if needed
	 *
	 * @param {IProfileData} [data]
	 * @return {IProfileData}
	 * @memberof Profile
	 */
	migrate(profile: IProfile, data: IProfileData): Promise<IProfileData>;
}
