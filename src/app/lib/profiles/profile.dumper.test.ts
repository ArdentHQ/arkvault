import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { Profile } from "./profile";
import { ProfileDumper } from "./profile.dumper";

describe("ProfileDumper", ({ beforeEach, afterEach, it, assert, nock, loader }) => {
	beforeEach(async (context) => {
		bootContainer();

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

		container.get(Identifiers.ProfileRepository).flush();

		context.profile = await container.get(Identifiers.ProfileRepository).create("John Doe");
		context.subject = new ProfileDumper(context.profile);
	});

	afterEach(() => {});

	it("should dump the profile with a password", async (context) => {
		context.profile.auth().setPassword("password");

		const { id, password, data } = context.subject.dump();

		assert.string(id);
		assert.string(password);
		assert.string(data);
	});

	it("should dump the profile without a password", async (context) => {
		const { id, password, data } = context.subject.dump();

		assert.string(id);
		assert.undefined(password);
		assert.string(data);
	});

	it("should fail to dump a profile with a password if the profile was not encrypted", () => {
		const profile = new Profile({ data: "", id: "uuid", name: "name", password: "password" });
		const subject = new ProfileDumper(profile);

		assert.throws(
			() => subject.dump(),
			"The profile [name] has not been encoded or encrypted. Please call [save] before dumping.",
		);
	});
});
