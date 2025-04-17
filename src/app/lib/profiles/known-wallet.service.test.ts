import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { KnownWalletService } from "./known-wallet.service.js";
import { Profile } from "./profile";

describe("KnownWalletService", ({ loader, it, assert, beforeEach, afterEach, nock }) => {
	beforeEach(async (context) => {
		bootContainer();

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
			.get("/ArkEcosystem/common/master/devnet/known-wallets-extended.json")
			.reply(200, [
				{
					address: "AagJoLEnpXYkxYdYkmdDSNMLjjBkLJ6T67",
					name: "ACF Hot Wallet",
					type: "team",
				},
				{
					address: "AWkBFnqvCF4jhqPSdE2HBPJiwaf67tgfGR",
					name: "ACF Hot Wallet (old)",
					type: "team",
				},
				{
					address: "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V",
					name: "Binance",
					type: "exchange",
				},
			])
			.persist();

		const profile = new Profile({ avatar: "avatar", data: "", id: "uuid", name: "name" });
		await profile.coins().set("ARK", "ark.devnet").__construct();

		context.subject = new KnownWalletService();

		await context.subject.syncAll(profile);
	});

	afterEach(() => nock.cleanAll());

	it("#name should succeed", async (context) => {
		assert.is(context.subject.name("ark.devnet", "AagJoLEnpXYkxYdYkmdDSNMLjjBkLJ6T67"), "ACF Hot Wallet");
		assert.is(context.subject.name("ark.devnet", "AWkBFnqvCF4jhqPSdE2HBPJiwaf67tgfGR"), "ACF Hot Wallet (old)");
		assert.is(context.subject.name("ark.devnet", "AWkBFnqvCF4jhqPSdE2HBPJiwaf67tgfGRa"), undefined);
	});

	it("#is should succeed", async (context) => {
		assert.true(context.subject.is("ark.devnet", "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V"));
		assert.false(context.subject.is("ark.devnet", "AagJoLEnpXYkxYdYkmdDSNMLjjBkLJ6T67s"));
	});

	it("#isExchange should succeed", async (context) => {
		assert.true(context.subject.isExchange("ark.devnet", "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V"));
		assert.false(context.subject.isExchange("ark.devnet", "AagJoLEnpXYkxYdYkmdDSNMLjjBkLJ6T67"));
		assert.false(context.subject.isExchange("unknown", "AagJoLEnpXYkxYdYkmdDSNMLjjBkLJ6T67"));
	});

	it("#isTeam should succeed", async (context) => {
		assert.true(context.subject.isTeam("ark.devnet", "AagJoLEnpXYkxYdYkmdDSNMLjjBkLJ6T67"));
		assert.false(context.subject.isTeam("ark.devnet", "AFrPtEmzu6wdVpa2CnRDEKGQQMWgq8nE9V"));
	});
});
