import { IProfileData, IProfileMainsailMigrator } from "./contracts.js";

export class ProfileMainsailMigrator implements IProfileMainsailMigrator {
	/**
	 * Migrates the profile data from Mainsail to ArkVault if needed.
	 *
	 * @param {IProfileData} [data]
	 * @return {Promise<IProfileData>}
	 * @memberof Profile
	 */
	public migrate(data: IProfileData): IProfileData {
		if (this.#requiresMigration(data)) {
			console.log("requires migration");
		}

		return data;
	}

	#requiresMigration(data: IProfileData): boolean {
		const wallets = Object.values(data.wallets);
		const firstWallet = wallets?.[0];

		if (!firstWallet) {
			return false;
		}

		const firstWalletNetwork = firstWallet.data["NETWORK"];
		// @TODO: consider the case where there are no wallets
		return firstWalletNetwork.startsWith("mainsail.");
	}
}
