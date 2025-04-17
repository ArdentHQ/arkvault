import { Coins } from "@ardenthq/sdk";
import { Base64 } from "@ardenthq/sdk-cryptography";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { IProfile, IProfileData, IProfileImporter, IProfileValidator, WalletData } from "./contracts.js";
import { Migrator } from "./migrator.js";
import { ProfileEncrypter } from "./profile.encrypter";
import { ProfileValidator } from "./profile.validator";

export class ProfileImporter implements IProfileImporter {
	readonly #profile: IProfile;
	readonly #validator: IProfileValidator;

	public constructor(profile: IProfile) {
		this.#profile = profile;
		this.#validator = new ProfileValidator();
	}

	/** {@inheritDoc IProfileImporter.import} */
	public async import(password?: string): Promise<void> {
		let data: IProfileData | undefined = await this.#unpack(password);

		if (container.has(Identifiers.MigrationSchemas) && container.has(Identifiers.MigrationVersion)) {
			await new Migrator(this.#profile, data).migrate(
				container.get(Identifiers.MigrationSchemas),
				container.get(Identifiers.MigrationVersion),
			);
		}

		data = this.#validator.validate(data);

		this.#profile.notifications().fill(data.notifications);

		this.#profile.data().fill(data.data);

		this.#profile.hosts().fill(data.hosts);

		this.#profile.networks().fill(data.networks);

		this.#profile.exchangeTransactions().fill(data.exchangeTransactions);

		this.#profile.plugins().fill(data.plugins);

		this.#profile.settings().fill(data.settings);

		this.#profile.coins().register();

		await this.#profile.wallets().fill(data.wallets);

		await this.#profile.pendingMusigWallets().fill(data.pendingMusigWallets);

		this.#profile.contacts().fill(data.contacts);

		this.#gatherCoins(data);
	}

	/**
	 * Validate the profile data after decoding and/or decrypting it.
	 *
	 * @private
	 * @param {string} [password]
	 * @return {Promise<IProfileData>}
	 * @memberof Profile
	 */
	async #unpack(password?: string): Promise<IProfileData> {
		let data: IProfileData | undefined;
		let errorReason = "";

		try {
			if (typeof password === "string") {
				this.#profile.password().set(password);

				data = await new ProfileEncrypter(this.#profile).decrypt(password);
			} else {
				data = JSON.parse(Base64.decode(this.#profile.getAttributes().get<string>("data")));
			}
		} catch (error) {
			errorReason = ` Reason: ${error.message}`;
		}

		if (data === undefined) {
			throw new Error(`Failed to decode or decrypt the profile.${errorReason}`);
		}

		return data;
	}

	/**
	 * Gather all known coins through wallets and contacts.
	 *
	 * @private
	 * @param {IProfileData} data
	 * @memberof ProfileImporter
	 */
	#gatherCoins(data: IProfileData): void {
		const isRegistered = (coin: string) => !!container.get<Coins.CoinBundle>(Identifiers.Coins)[coin.toUpperCase()];

		for (const wallet of Object.values(data.wallets)) {
			if (isRegistered(wallet.data[WalletData.Coin])) {
				this.#profile.coins().set(wallet.data[WalletData.Coin], wallet.data[WalletData.Network]);
			}
		}
	}
}
