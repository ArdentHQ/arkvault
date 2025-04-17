import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { ProfileData, ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ProfileInitialiser } from "./profile.initialiser";

describe("ProfileInitialiser", ({ afterAll, afterEach, beforeAll, beforeEach, it, assert, loader, nock }) => {
	beforeAll(() => {
		nock.fake()
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get("/api/wallets/DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))
			.persist();
	});

	beforeEach((context) => {
		bootContainer();

		context.profile = new Profile({ data: "", id: "uuid", name: "name" });
	});

	it("should flush service data", (context) => {
		context.profile.contacts().create("test", [
			{
				address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
				coin: "ARK",
				network: "ark.devnet",
			},
		]);
		context.profile.data().set(ProfileData.HasCompletedIntroductoryTutorial, true);
		context.profile.settings().set(ProfileSetting.Theme, "dark");

		assert.is(context.profile.contacts().count(), 1);
		assert.true(context.profile.data().get(ProfileData.HasCompletedIntroductoryTutorial));
		assert.is(context.profile.settings().get(ProfileSetting.Theme), "dark");

		new ProfileInitialiser(context.profile).initialise("name");

		assert.is(context.profile.contacts().count(), 0);
		assert.undefined(context.profile.data().get(ProfileData.HasCompletedIntroductoryTutorial));
		assert.is(context.profile.settings().get(ProfileSetting.Theme), "light");
	});

	it("should initialise the default settings", (context) => {
		assert.undefined(context.profile.settings().get(ProfileSetting.Name));
		assert.undefined(context.profile.settings().get(ProfileSetting.Theme));

		new ProfileInitialiser(context.profile).initialiseSettings("name");

		assert.is(context.profile.settings().get(ProfileSetting.Name), "name");
		assert.is(context.profile.settings().get(ProfileSetting.Theme), "light");
	});
});
