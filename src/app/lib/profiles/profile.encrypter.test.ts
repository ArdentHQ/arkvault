import { describe, beforeEach, it, expect } from "vitest";
import { IProfile, IProfileEncrypter } from "./contracts";
import { ProfileEncrypter } from "./profile.encrypter";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { PBKDF2, Base64 } from "@ardenthq/arkvault-crypto";
import { cbc } from "@noble/ciphers/aes.js";
import { md5 } from "@noble/hashes/legacy.js";
import { concatBytes, randomBytes } from "@noble/hashes/utils.js";

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

function legacyAESEncrypt(plaintext: string, password: string): string {
	const salt = randomBytes(8);
	const { key, iv } = evpBytesToKey(password, salt);
	const plaintextBytes = new TextEncoder().encode(plaintext);
	const encrypted = cbc(key, iv).encrypt(plaintextBytes);
	const header = new TextEncoder().encode("Salted__");
	const result = concatBytes(header, salt, encrypted);
	return btoa(Array.from(result, (b) => String.fromCharCode(b)).join(""));
}

describe("ProfileEncrypter", () => {
	let profile: IProfile;
	let subject: IProfileEncrypter;
	const password = "my-password";
	const dataToEncrypt = "plain text data";

	beforeEach(async () => {
		profile = env.profiles().findById(getMainsailProfileId());
		await profile.auth().setPassword(password);
		subject = new ProfileEncrypter(profile);
	});

	describe("encrypt", () => {
		it("should encrypt the given value", async () => {
			const encrypted = await subject.encrypt(dataToEncrypt, password);
			const decrypted = await PBKDF2.decrypt(encrypted, password);
			expect(decrypted).toBe(dataToEncrypt);
		});

		it("should use the profile password if none is provided", async () => {
			profile.password().set(password);
			const encrypted = await subject.encrypt(dataToEncrypt);
			const decrypted = await PBKDF2.decrypt(encrypted, password);
			expect(decrypted).toBe(dataToEncrypt);
		});

		it("should throw if the wrong password is provided", async () => {
			await expect(subject.encrypt(dataToEncrypt, "wrong-password")).rejects.toThrow(
				"The password did not match our records.",
			);
		});
	});

	describe("decrypt", () => {
		it("should decrypt the given value", async () => {
			const profileData = { data: { wallets: {} }, id: profile.id() };
			const encrypted = await PBKDF2.encrypt(JSON.stringify(profileData), password);
			const base64 = Base64.encode(encrypted);

			profile.getAttributes().set("data", base64);

			expect(profile.usesPassword()).toBe(true);

			const decrypted = await subject.decrypt(password);
			expect(decrypted).toEqual({ id: profile.id(), wallets: {} });
		});

		it("should throw if the profile does not use a password", async () => {
			profile.getAttributes().forget("password");

			await expect(subject.decrypt("any-password")).rejects.toThrow(
				"This profile does not use a password but password was passed for decryption",
			);
		});

		it("should fallback to AES decryption for legacy data", async () => {
			const profileData = { data: { wallets: { legacy: true } } };
			const aesEncrypted = legacyAESEncrypt(JSON.stringify(profileData), password);
			const base64 = Base64.encode(aesEncrypted);

			profile.getAttributes().set("data", base64);

			const decrypted = await subject.decrypt(password);
			expect(decrypted).toEqual({ wallets: { legacy: true } });
		});
	});
});
