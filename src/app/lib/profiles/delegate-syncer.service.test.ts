import { describeEach } from "@ardenthq/sdk-test";

import { bootContainer, makeCoin } from "../test/mocking";
import { ParallelDelegateSyncer, SerialDelegateSyncer } from "./delegate-syncer.service.js";

describeEach(
	"DelegateSyncer(%s)",
	({ assert, beforeEach, dataset, it, nock, loader }) => {
		beforeEach(async (context) => {
			bootContainer();

			nock.fake()
				.get("/api/node/configuration")
				.reply(200, loader.json("test/fixtures/client/configuration.json"))
				.get("/api/node/configuration/crypto")
				.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
				.get("/api/node/syncing")
				.reply(200, loader.json("test/fixtures/client/syncing.json"))
				.persist();

			const coin = await makeCoin("ARK", "ark.devnet");

			if (dataset === "serial") {
				context.subject = new SerialDelegateSyncer(coin.client());
			} else {
				context.subject = new ParallelDelegateSyncer(coin.client());
			}
		});

		it("should sync", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
				.get("/api/delegates?page=2")
				.reply(200, loader.json("test/fixtures/client/delegates-2.json"));

			assert.length(await context.subject.sync(), 200);
		});

		it("should sync single page", async (context) => {
			nock.fake()
				.get("/api/delegates")
				.reply(200, loader.json("test/fixtures/client/delegates-single-page.json"))
				.persist();

			assert.length(await context.subject.sync(), 10);
		});
	},
	["serial", "parallel"],
);
