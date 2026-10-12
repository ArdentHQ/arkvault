import { describe, beforeEach, it, expect } from "vitest";
import { IProfile, IProfileEncrypter } from "./contracts";
import { ProfileEncrypter } from "./profile.encrypter";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { PBKDF2, Base64 } from "@ardenthq/arkvault-crypto";

// crypto-js@4.2.0: AES.encrypt('{"data":{"wallets":{"legacy":true}}}', "my-password").toString()
const LEGACY_FIXTURE_ASCII = "U2FsdGVkX19grIMNTCW8AxTGRfWnyM4hBr3WeT7gmBAbJhT0MjSiKw+nYSkuZpbt6KJNDCbQTWP1/h1xWGoX2w==";
// crypto-js@4.2.0: AES.encrypt('{"data":{"wallets":{"unicode":true}}}', "pässwörð").toString()
const LEGACY_FIXTURE_UNICODE = "U2FsdGVkX1/YJdsl10e9lCodV/e5bmEj0wCLmA6mCI9qWW+3UicCcZEIbfXpJTgEmRiwCv6MnMte6+F+iOshGg==";

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

		it("should fallback to legacy AES decryption for old profile data", async () => {
			profile.getAttributes().set("data", Base64.encode(LEGACY_FIXTURE_ASCII));

			const decrypted = await subject.decrypt(password);
			expect(decrypted).toEqual({ wallets: { legacy: true } });
		});

		it("should decrypt legacy data with unicode password", async () => {
			profile.getAttributes().set("data", Base64.encode(LEGACY_FIXTURE_UNICODE));

			const decrypted = await subject.decrypt("pässwörð");
			expect(decrypted).toEqual({ wallets: { unicode: true } });
		});

		it("should throw for wrong password on legacy data", async () => {
			profile.getAttributes().set("data", Base64.encode(LEGACY_FIXTURE_ASCII));

			await expect(subject.decrypt("wrong-password")).rejects.toThrow("unable to decrypt data");
		});
	});
});
