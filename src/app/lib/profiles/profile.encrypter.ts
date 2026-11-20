import { AES, Base64, PBKDF2 } from "@ardenthq/arkvault-crypto";

import { IProfile, IProfileData, IProfileEncrypter } from "./contracts.js";
import { isLegacyEncryption } from "./helpers/legacy-encryption.js";

export class ProfileEncrypter implements IProfileEncrypter {
	readonly #profile: IProfile;

	public constructor(profile: IProfile) {
		this.#profile = profile;
	}

	/** {@inheritDoc IProfileEncrypter.encrypt} */
	public async encrypt(unencrypted: string, password?: string): Promise<string> {
		if (typeof password !== "string") {
			password = this.#profile.password().get();
		}

		if (!this.#profile.auth().verifyPassword(password)) {
			throw new Error("The password did not match our records.");
		}

		return PBKDF2.encrypt(unencrypted, password);
	}

	/** {@inheritDoc IProfileEncrypter.decrypt} */
	public async decrypt(password: string): Promise<IProfileData> {
		if (!this.#profile.usesPassword()) {
			throw new Error("This profile does not use a password but password was passed for decryption");
		}

		const decodedData = Base64.decode(this.#profile.getAttributes().get<string>("data"));

		if (isLegacyEncryption(decodedData)) {
			const profileData = JSON.parse(AES.decrypt(decodedData, password));

			return { ...profileData.data };
		}

		const { id, data } = JSON.parse(await PBKDF2.decrypt(decodedData, password));
		return { id, ...data };
	}
}
