import { Base64, PBKDF2 } from "@ardenthq/arkvault-crypto";

import { IProfile, IProfileData, IProfileEncrypter } from "./contracts.js";
import { cbc } from "@noble/ciphers/aes.js";
import { md5 } from "@noble/hashes/legacy.js";
import { concatBytes } from "@noble/hashes/utils.js";

function evpBytesToKey(password: string, salt: Uint8Array): { key: Uint8Array; iv: Uint8Array } {
	const passwordBytes = new TextEncoder().encode(password);
	let derived = new Uint8Array(0);
	let block = new Uint8Array(0);

	while (derived.length < 48) {
		block = md5(concatBytes(block, passwordBytes, salt));
		derived = concatBytes(derived, block);
	}

	return { iv: derived.slice(32, 48), key: derived.slice(0, 32) };
}

function legacyAESDecrypt(ciphertextBase64: string, password: string): string {
	const bytes = Uint8Array.from(atob(ciphertextBase64), (c) => c.charCodeAt(0));
	const salt = bytes.slice(8, 16);
	const ciphertext = bytes.slice(16);
	const { key, iv } = evpBytesToKey(password, salt);
	return new TextDecoder().decode(cbc(key, iv).decrypt(ciphertext));
}

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

		try {
			const { id, data } = JSON.parse(await PBKDF2.decrypt(decodedData, password));
			return { id, ...data };
		} catch (error) {
			if (error instanceof Error && error.message.includes("is not valid JSON")) {
				const decryptedData = legacyAESDecrypt(decodedData, password);

				const profileData = JSON.parse(decryptedData);

				return {
					...profileData.data,
				};
			}

			throw error;
		}
	}
}
