import { describe, vi } from "vitest";
import { test } from "@/utils/testing-library";
import { http, HttpResponse } from "msw";
import { server } from "@/tests/mocks/server";

describe("Validator Service", () => {
	test("#all", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id());
		const validators = profile.validators().all(profile.activeNetwork().id());
		expect(validators).toHaveLength(59);
	});

	test("#syncAll", async ({ profile }) => {
		await profile.validators().syncAll();
		const validators = profile.validators().all(profile.activeNetwork().id());
		expect(validators).toHaveLength(59);
	});

	test("#findByAddress", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id());
		const address = "0xB8Be76b31E402a2D89294Aa107056484Bef94362";
		const validator = profile.validators().findByAddress(profile.activeNetwork().id(), address);
		expect(validator.address()).toBe(address);
	});

	test("#findByPublicKey", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id());
		const publicKey = "0375e624da5204a6b1181673d9027b534269a7bdf288bc6067c675f8d144cf8698";
		const validator = profile.validators().findByPublicKey(profile.activeNetwork().id(), publicKey);
		expect(validator.publicKey()).toBe(publicKey);
	});

	test("#map", async ({ profile, defaultWallet }) => {
		await profile.validators().syncAll();
		const mapped = profile.validators().map(defaultWallet, [defaultWallet.publicKey()!]);
		expect(mapped.at(0)?.publicKey()).toBe(defaultWallet.publicKey());
	});

	test("#publiKeyExists", async ({ profile }) => {
		await profile.validators().syncAll();
		const exists = await profile.validators().publicKeyExists("123", profile.activeNetwork());
		expect(exists).toBe(false);
	});

	test("#findByUsername", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id());
		const username = "vault_test_address";
		const validator = profile.validators().findByUsername(profile.activeNetwork().id(), username);
		expect(validator.username()).toBe(username);
	});

	test("#sync with force option", async ({ profile }) => {
		await profile.validators().sync(profile.activeNetwork().id(), { force: true });
		const validators = profile.validators().all(profile.activeNetwork().id());
		expect(validators).toHaveLength(59);
	});

	test("#map should return empty array", async ({ profile, defaultWallet }) => {
		await profile.validators().syncAll();
		const mapped = profile.validators().map(defaultWallet, []);
		expect(mapped).toHaveLength(0);
	});

	test("#mapByIdentifier falls back to findByAddress when findByPublicKey fails", async ({
		profile,
		defaultWallet,
	}) => {
		await profile.validators().syncAll();
		const address = defaultWallet.address();
		const mapped = profile.validators().mapByIdentifier(defaultWallet, address);
		expect(mapped?.address()).toBe(address);
	});

	test("#publicKeyExists with empty string", async ({ profile }) => {
		const exists = await profile.validators().publicKeyExists("", profile.activeNetwork());
		expect(exists).toBe(false);
	});

	test("#mapByIdentifier returns undefined when both findByPublicKey and findByAddress fail", async ({
		profile,
		defaultWallet,
	}) => {
		await profile.validators().syncAll();
		const mapped = profile.validators().mapByIdentifier(defaultWallet, "non-existent-identifier");
		expect(mapped).toBeUndefined();
	});

	test("#publicKeyExists returns false when API returns 404", async ({ profile }) => {
		server.use(http.get(/.*\/wallets.*/, () => new HttpResponse(null, { status: 404 })));

		const exists = await profile.validators().publicKeyExists("03nonexistent", profile.activeNetwork());
		expect(exists).toBe(false);
	});

	test("#publicKeyExists returns true when API returns data with count > 0", async ({ profile }) => {
		server.use(
			http.get(/.*\/wallets.*/, () =>
				HttpResponse.json({
					data: [{ address: "0xTest" }],
					meta: { count: 1 },
				}),
			),
		);

		const exists = await profile
			.validators()
			.publicKeyExists(
				"0375e624da5204a6b1181673d9027b534269a7bdf288bc6067c675f8d144cf8698",
				profile.activeNetwork(),
			);
		expect(exists).toBe(true);
	});
});
