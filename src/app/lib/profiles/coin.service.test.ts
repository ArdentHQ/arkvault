import { Coins } from "@ardenthq/sdk";
import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { CoinService } from "./coin.service.js";
import { DataRepository } from "./data.repository";
import { Profile } from "./profile";

describe("CoinService", async ({ assert, it, beforeEach, loader, nock, stub, spy }) => {
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
		context.subject = new CoinService(context.profile, new DataRepository());
	});

	it("#set should succeed", (context) => {
		context.subject.set("ARK", "ark.devnet");
		const coin = context.subject.get("ARK", "ark.devnet");
		assert.is(coin.network().id(), "ark.devnet");
	});

	it("#has should succeed", async (context) => {
		context.subject.set("ARK", "ark.devnet");

		assert.true(context.subject.has("ARK", "ark.devnet"));
		assert.false(context.subject.has("UNKNOWN", "ark.devnet"));
	});

	it("#get should succeed", async (context) => {
		context.subject.set("ARK", "ark.devnet");

		assert.is(context.subject.get("ARK", "ark.devnet").network().id(), "ark.devnet");
		assert.throws(() => context.subject.get("ARK", "unknown"), /does not exist/);
	});

	it("#values should succeed", async (context) => {
		context.subject.set("ARK", "ark.devnet");

		const values = context.subject.values();
		// assert.is(values, [{ ark: { devnet: expect.anything() } }]);
		assert.array(values);
		assert.instance(values[0].ark.devnet, Coins.Coin);
	});

	it("#all should succeed", async (context) => {
		context.subject.set("ARK", "ark.devnet");

		assert.equal(Object.keys(context.subject.all()), ["ARK"]);
	});

	it("#entries should succeed", async (context) => {
		context.subject.set("ARK", "ark.devnet");

		assert.equal(context.subject.entries(), [["ARK", ["ark.devnet"]]]);

		stub(context.subject, "all").returnValue({ ARK: { ark: undefined } });

		assert.equal(context.subject.entries(), [["ARK", ["ark"]]]);
	});

	it("#flush should succeed", async (context) => {
		const dataRepository = { flush: () => {} };

		const flushSpy = spy(dataRepository, "flush");

		context.subject = new CoinService(context.profile, dataRepository as any);

		context.subject.flush();

		assert.true(flushSpy.calledOnce);
	});
});
