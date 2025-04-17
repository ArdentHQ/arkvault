import { Base64 } from "@ardenthq/sdk-cryptography";

import { IProfile, IProfileExporter, IProfileExportOptions } from "./contracts.js";
import { ProfileEncrypter } from "./profile.encrypter";
import { ProfileSerialiser } from "./profile.serialiser";

export class ProfileExporter implements IProfileExporter {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IProfileExporter.export} */
	public async export(
		password?: string,
		options: IProfileExportOptions = {
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
			saveGeneralSettings: true,
		},
	): Promise<string> {
		const data = new ProfileSerialiser(this.#profile).toJSON(options);

		if (this.#profile.usesPassword()) {
			return Base64.encode(
				await new ProfileEncrypter(this.#profile).encrypt(
					JSON.stringify({
						avatar: this.#profile.avatar(),
						data,
						id: this.#profile.id(),
						name: this.#profile.name(),
						password: this.#profile.getAttributes().get<string>("password"),
					}),
					password,
				),
			);
		}

		return Base64.encode(JSON.stringify(data));
	}
}
