import { Base64 } from "@ardenthq/arkvault-crypto";

import { IProfile, IProfileData, IProfileImporter, IProfileValidator, IProfileMainsailMigrator } from "./contracts.js";
import { Migrator } from "./migrator.js";
import { ProfileEncrypter } from "./profile.encrypter";
import { ProfileValidator } from "./profile.validator";
import { Environment } from "./environment.js";
import { ProfileMainsailMigrator } from "./profile.mainsail-migrator.js";

export class ProfileImporter implements IProfileImporter {
	readonly #profile: IProfile;
	readonly #validator: IProfileValidator;
	readonly #migrator: IProfileMainsailMigrator;
	readonly #env: Environment;
	#skipMigration: boolean = false;

	public constructor(profile: IProfile, env: Environment) {
		this.#profile = profile;
		this.#validator = new ProfileValidator();
		this.#migrator = new ProfileMainsailMigrator();
		this.#env = env;
	}

	public skipMigration(): ProfileImporter {
		this.#skipMigration = true;
		return this;
	}

	/** {@inheritDoc IProfileImporter.import} */
	public async import(password?: string): Promise<void> {
		let data: IProfileData | undefined = await this.#unpack(password);

		const schemas = this.#env.migrationSchemas();
		const version = this.#env.migrationVersion();

		if (!!schemas && !!version) {
			await new Migrator(this.#profile, data).migrate(schemas, version);
		}

		if (!this.#skipMigration) {
			data = await this.#migrator.migrate(this.#profile, data);
		}

		data = this.#validator.validate(data);

		this.#profile.notifications().fill(data.notifications);

		this.#profile.data().fill(data.data);

		this.#profile.hosts().fill(data.hosts);

		this.#profile.networks().fill(data.networks);

		this.#profile.exchangeTransactions().fill(data.exchangeTransactions);

		this.#profile.settings().fill(data.settings);

		this.#profile.wallets().fill(data.wallets);

		this.#profile.contacts().fill(data.contacts);

		this.#profile.exchangeRates().restore();
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

		if (!data.data && !password) {
			throw new Error("PasswordRequired");
		}

		return data;
	}
}
