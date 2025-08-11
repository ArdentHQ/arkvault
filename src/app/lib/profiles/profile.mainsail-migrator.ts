import { IProfile, IProfileData, IProfileMainsailMigrator } from "./contracts.js";

export class ProfileMainsailMigrator implements IProfileMainsailMigrator {
	/**
	 * Migrates the profile data from Mainsail to ArkVault if needed.
	 *
	 * @param {IProfileData} [data]
	 * @return {Promise<IProfileData>}
	 * @memberof Profile
	 */
	public async migrate(profile: IProfile, data: IProfileData): Promise<IProfileData> {
		if (this.#requiresMigration(data)) {
			data.wallets = await this.#migrateWallets(profile, data.wallets);
		}

		return data;
	}

	async #migrateWallets(profile: IProfile, wallets: IProfileData["wallets"]): Promise<IProfileData["wallets"]> {
		const migratedWallets: IProfileData["wallets"] = {};

		for (const [id, wallet] of Object.entries(wallets)) {
			const migratedWallet = await this.#migrateWallet(profile, wallet);
			if (migratedWallet !== undefined) {
				migratedWallets[id] = migratedWallet;
			}
		}

		return migratedWallets;
	}

	async #migrateWallet(
		profile: IProfile,
		wallet: IProfileData["wallets"][string],
	): Promise<IProfileData["wallets"][string] | undefined> {
		const newData = await this.#migrateWalletAddress(profile, wallet.data);

		if (newData === undefined) {
			return undefined;
		}

		const migratedWallet: IProfileData["wallets"][string] = {
			...wallet,
			data: {
				...wallet.data,
				...newData,
			},
		};

		return migratedWallet;
	}

	async #migrateWalletAddress(
		profile: IProfile,
		walletData: IProfileData["wallets"][string]["data"],
	): Promise<IProfileData["wallets"][string]["data"] | undefined> {
		const publicKey = walletData["PUBLIC_KEY"];
		if (publicKey === undefined) {
			return undefined;
		}

		const wallet = await profile.walletFactory().fromPublicKey({ publicKey });
		const migratedWalletData: IProfileData["wallets"][string]["data"] = {
			ADDRESS: wallet.address(),
		};

		return migratedWalletData;
	}

	#requiresMigration(data: IProfileData): boolean {
		const wallets = Object.values(data.wallets);
		const firstWallet = wallets?.[0];

		// @TODO: consider the case where there are no wallets
		if (!firstWallet) {
			return false;
		}

		const firstWalletNetwork = firstWallet.data["NETWORK"];

		return firstWalletNetwork.startsWith("ark.");
	}
}
