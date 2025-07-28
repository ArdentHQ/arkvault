import { IProfileData } from "./contracts.js";

export interface IProfileMainsailMigrator {
	/**
	 * Migrates the profile data from Mainsail to ArkVault if needed
	 *
	 * @param {IProfileData} [data]
	 * @return {IProfileData}
	 * @memberof Profile
	 */
	migrate(data: IProfileData): IProfileData;
}
