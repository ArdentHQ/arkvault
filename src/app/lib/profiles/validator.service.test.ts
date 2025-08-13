import { describe } from "vitest";
import { test } from "@/utils/testing-library";

describe("Validator Service", () => {
	test("#all", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id())
		const validators = profile.validators().all(profile.activeNetwork().id())
		expect(validators).toHaveLength(59)
	});

	test("#syncAll", async ({ profile }) => {
		await profile.validators().syncAll()
		const validators = profile.validators().all(profile.activeNetwork().id())
		expect(validators).toHaveLength(59)
	});

	test("#findByAddress", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id())
		const address = "0xB8Be76b31E402a2D89294Aa107056484Bef94362"
		const validator = profile.validators().findByAddress(profile.activeNetwork().id(), address)
		expect(validator.address()).toBe(address)
	});

	test("#findByPublicKey", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id())
		const publicKey = "0375e624da5204a6b1181673d9027b534269a7bdf288bc6067c675f8d144cf8698";
		const validator = profile.validators().findByPublicKey(profile.activeNetwork().id(), publicKey)
		expect(validator.publicKey()).toBe(publicKey)
	});

	test("#map", async ({ profile, defaultWallet }) => {
		await profile.validators().syncAll()
		const mapped = profile.validators().map(defaultWallet, [defaultWallet.publicKey()!])
		expect(mapped.at(0)?.publicKey()).toBe(defaultWallet.publicKey())
	});

	test("#publiKeyExists", async ({ profile }) => {
		await profile.validators().syncAll()
		const exists = await profile.validators().publicKeyExists("123", profile.activeNetwork())
		expect(exists).toBe(false)
	});

});
