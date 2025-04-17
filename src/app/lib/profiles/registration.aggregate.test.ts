import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { Profile } from "./profile";
import { RegistrationAggregate } from "./registration.aggregate";

describe("RegistrationAggregate", ({ beforeEach, it, assert, nock, loader }) => {
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
			.reply(200, loader.json("test/fixtures/client/wallet-non-resigned.json"))
			.persist();

		const profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });

		await importByMnemonic(profile, identity.mnemonic, "ARK", "ark.devnet");

		context.subject = new RegistrationAggregate(profile);
	});

	it("#delegates", async (context) => {
		const delegates = context.subject.delegates();

		assert.length(delegates, 1);
		assert.is(delegates[0].address(), "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
	});
});
