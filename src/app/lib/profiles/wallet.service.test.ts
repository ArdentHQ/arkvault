import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { ProfileRepository } from "./profile.repository";
import { WalletService } from "./wallet.service.js";

describe("WalletService", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll(() => bootContainer());

	beforeEach(async (context) => {
		nock.fake()
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get("/api/delegates")
			.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
			.get("/api/delegates?page=2")
			.reply(200, loader.json("test/fixtures/client/delegates-2.json"))
			// coingecho
			.get("/api/v3/coins/dark/history")
			.query(true)
			.reply(200, {
				id: "ark",
				market_data: {
					current_price: {
						btc: 0.000_659_083_239_663_580_1,
					},
					market_cap: {
						btc: 64_577.822_085_117_3,
					},
					total_volume: {
						btc: 3054.811_710_196_453_5,
					},
				},
				name: "Ark",
				symbol: "ark",
			})
			// coingecho
			.get("/api/v3/coins/list")
			.query(true)
			.reply(200, [
				{
					id: "ark",
					name: "ark",
					symbol: "ark",
				},
				{
					id: "dark",
					name: "dark",
					symbol: "dark",
				},
			])
			.persist();

		const profileRepository = new ProfileRepository();

		if (container.has(Identifiers.ProfileRepository)) {
			container.unbind(Identifiers.ProfileRepository);
		}

		container.constant(Identifiers.ProfileRepository, profileRepository);

		context.profile = await profileRepository.create("John Doe");

		context.profile.coins().set("ARK", "ark.devnet");

		context.wallet = await importByMnemonic(context.profile, identity.mnemonic, "ARK", "ark.devnet");

		context.networkSpy = stub(context.profile, "availableNetworks").returnValue([context.wallet.network()]);

		context.liveSpy = stub(context.wallet.network(), "isLive").returnValue(true);
		context.testSpy = stub(context.wallet.network(), "isTest").returnValue(false);

		context.subject = new WalletService();
	});

	it("#syncByProfile", async (context) => {
		assert.throws(() => context.wallet.voting().current(), /has not been synced/);

		await context.subject.syncByProfile(context.profile);

		assert.not.throws(() => context.wallet.voting().current(), /has not been synced/);

		stub(context.profile.wallets(), "values").returnValue([]);
		await context.subject.syncByProfile(context.profile);
	});
});
