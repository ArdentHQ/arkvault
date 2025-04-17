import { Collections, DTO } from "@ardenthq/sdk";
import { describe } from "@ardenthq/sdk-test";

import { Profile } from "./profile.js";
import { UsernamesService } from "./usernames.service.js";

describe("UsernamesService", ({ assert, beforeEach, afterEach, it, nock, loader, stub }) => {
	let subject: UsernamesService;
	let profile: Profile;

	beforeEach(async () => {
		nock.fake()
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.persist();

		const usernameDataCollection = new Collections.UsernameDataCollection([
			new DTO.UsernameData({
				address: "0x6F0182a0cc707b055322CcF6d4CB6a5Aff1aEb22",
				username: "testingusername",
			}),
			new DTO.UsernameData({
				address: "0x93485b57ff3DeD81430D08579142fAe8234c6A17",
				username: "test1",
			}),
		]);

		profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });

		const coinMock = {
			client: () => ({
				usernames: () => usernameDataCollection,
			}),
		};

		stub(profile.coins(), "get").returnValue(coinMock);

		subject = new UsernamesService();

		const addresses = ["0x93485b57ff3DeD81430D08579142fAe8234c6A17", "0x6F0182a0cc707b055322CcF6d4CB6a5Aff1aEb22"];
		await subject.syncUsernames(profile, "Mainsail", "mainsail.devnet", addresses);
	});

	afterEach(() => {
		nock.cleanAll();
	});

	it("#username should succeed", async () => {
		assert.is(subject.username("mainsail.devnet", "0x93485b57ff3DeD81430D08579142fAe8234c6A17"), "test1");
		assert.is(subject.username("mainsail.devnet", "0x6F0182a0cc707b055322CcF6d4CB6a5Aff1aEb22"), "testingusername");
		assert.is(subject.username("mainsail.devnet", "0xUnknownAddress"), undefined);
	});

	it("#has should succeed", async () => {
		assert.true(subject.has("mainsail.devnet", "0x93485b57ff3DeD81430D08579142fAe8234c6A17"));
		assert.true(subject.has("mainsail.devnet", "0x6F0182a0cc707b055322CcF6d4CB6a5Aff1aEb22"));
		assert.false(subject.has("mainsail.devnet", "0xUnknownAddress"));
	});
});
