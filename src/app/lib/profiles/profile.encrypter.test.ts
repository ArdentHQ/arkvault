import { describe, beforeEach, it, expect } from "vitest";
import { IProfile, IProfileEncrypter } from "./contracts";
import { ProfileEncrypter } from "./profile.encrypter";
import { env, getMainsailProfileId } from "@/utils/testing-library";
import { PBKDF2, Base64 } from "@ardenthq/arkvault-crypto";

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
	});
});
