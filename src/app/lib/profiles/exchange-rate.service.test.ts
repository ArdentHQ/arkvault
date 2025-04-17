import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { ProfileSetting, WalletData } from "./contracts";
import { ExchangeRateService } from "./exchange-rate.service.js";
import { ProfileRepository } from "./profile.repository";

describe("ExchangeRateService", ({ beforeEach, afterEach, it, assert, nock, loader, stub }) => {
	beforeEach(async (context) => {
		bootContainer();

		nock.fake()
			// ARK Core
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
			// CryptoCompare
			.get("/data/histoday")
			.query(true)
			.reply(200, loader.json("test/fixtures/markets/cryptocompare/historical.json"))
			.persist();

		const profileRepository = new ProfileRepository();
		context.subject = new ExchangeRateService();

		if (container.has(Identifiers.ProfileRepository)) {
			container.unbind(Identifiers.ProfileRepository);
		}

		container.constant(Identifiers.ProfileRepository, profileRepository);

		if (container.has(Identifiers.ExchangeRateService)) {
			container.unbind(Identifiers.ExchangeRateService);
		}

		container.constant(Identifiers.ExchangeRateService, context.subject);

		context.profile = await profileRepository.create("John Doe");
		context.profile.settings().set(ProfileSetting.MarketProvider, "cryptocompare");

		context.wallet = await importByMnemonic(context.profile, identity.mnemonic, "ARK", "ark.devnet");
		context.wallet.data().set(WalletData.Balance, { available: 1e8, fees: 1e8 });

		context.liveSpy = stub(context.wallet.network(), "isLive").returnValue(true);
		context.testSpy = stub(context.wallet.network(), "isTest").returnValue(false);
	});

	it("should sync a coin for specific profile with wallets argument", async (context) => {
		nock.fake()
			.get("/data/dayAvg")
			.query(true)
			.reply(200, { BTC: 0.000_050_48, ConversionType: { conversionSymbol: "", type: "direct" } })
			.persist();

		await context.subject.syncAll(context.profile, "DARK");

		assert.is(context.wallet.convertedBalance(), 0.000_050_48);
		const allStorage = await container.get(Identifiers.Storage).all();
		assert.object(allStorage.EXCHANGE_RATE_SERVICE);
	});

	it("should sync a coin for specific profile without wallets argument", async (context) => {
		nock.fake()
			.get("/data/dayAvg")
			.query(true)
			.reply(200, { BTC: 0.000_021_34, ConversionType: { conversionSymbol: "", type: "direct" } })
			.persist();

		await context.subject.syncAll(context.profile, "DARK");

		assert.is(context.wallet.convertedBalance(), 0.000_021_34);
	});

	it("should fail to sync a coin for a specific profile if there are no wallets", async (context) => {
		context.profile.wallets().flush();

		assert.undefined(context.wallet.data().get(WalletData.ExchangeCurrency));

		await context.subject.syncAll(context.profile, "DARK");

		assert.undefined(context.wallet.data().get(WalletData.ExchangeCurrency));
	});

	it("should store exchange rates and currency in profile wallets if undefined", async (context) => {
		nock.fake()
			.get("/data/dayAvg")
			.query(true)
			.reply(200, { BTC: 0.000_050_48, ConversionType: { conversionSymbol: "", type: "direct" } })
			.persist();

		context.profile.settings().set(ProfileSetting.MarketProvider, "cryptocompare");

		await context.subject.syncAll(context.profile, "DARK");
		assert.is(context.wallet.convertedBalance(), 0.000_050_48);
	});

	it("should cache historic exchange rates", async (context) => {
		nock.fake()
			.get("/data/dayAvg")
			.query(true)
			.reply(200, { BTC: 0.000_050_48, ConversionType: { conversionSymbol: "", type: "direct" } })
			.persist();

		context.profile.settings().set(ProfileSetting.MarketProvider, "cryptocompare");

		await context.subject.syncAll(context.profile, "DARK");
		assert.is(context.wallet.convertedBalance(), 0.000_050_48);

		nock.fake()
			.get("/data/dayAvg")
			.query(true)
			.reply(200, { BTC: 0.000_055_55, ConversionType: { conversionSymbol: "", type: "direct" } })
			.persist();

		await context.subject.syncAll(context.profile, "DARK");
		// The price should be the cached price from previous sync: 0.00005048
		assert.is(context.wallet.convertedBalance(), 0.000_050_48);
	});

	it("should handle restore", async (context) => {
		await assert.resolves(() => context.subject.restore());

		assert.object(await container.get(Identifiers.Storage).get("EXCHANGE_RATE_SERVICE"));

		container.get(Identifiers.Storage).set("EXCHANGE_RATE_SERVICE", null);
		await assert.resolves(() => context.subject.restore());

		container.get(Identifiers.Storage).set("EXCHANGE_RATE_SERVICE", undefined);
		await assert.resolves(() => context.subject.restore());
	});
});
