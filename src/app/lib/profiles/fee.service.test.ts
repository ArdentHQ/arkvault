import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { FeeService } from "./fee.service.js";
import { Profile } from "./profile";

describe("FeeService", ({ beforeEach, loader, nock, it, assert }) => {
	beforeEach((context) => {
		bootContainer();

		nock.fake()
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/fees")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/node-fees.json"))
			.get("/api/transactions/fees")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transaction-fees.json"))
			.persist();

		context.profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });
		context.profile.coins().set("ARK", "ark.devnet");

		context.subject = new FeeService();
	});

	it("should sync fees", async (context) => {
		assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

		await context.subject.sync(context.profile, "ARK", "ark.devnet");
		assert.length(Object.keys(context.subject.all("ARK", "ark.devnet")), 10);
	});

	it("should sync fees of all coins", async (context) => {
		assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

		await context.subject.syncAll(context.profile);

		assert.length(Object.keys(context.subject.all("ARK", "ark.devnet")), 10);
	});

	it("#findByType", async (context) => {
		assert.throws(() => context.subject.all("ARK", "ark.devnet"), "have not been synchronized yet");

		await context.subject.syncAll(context.profile);

		const fees = context.subject.findByType("ARK", "ark.devnet", "transfer");

		assert.is(fees.min.toHuman(), 0.003_57);
		assert.is(fees.avg.toHuman(), 0.1);
		assert.is(fees.max.toHuman(), 0.1);
		assert.is(fees.static.toHuman(), 0.1);
	});
});
