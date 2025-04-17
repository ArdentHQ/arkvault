import { ProfileData, ProfileSetting } from "./contracts";

import { ARK } from "@ardenthq/sdk-ark";
import { DataRepository } from "./data.repository";
import { Environment } from "./environment";
import { ExchangeRateService } from "./exchange-rate.service.js";
import { Helpers } from "@ardenthq/sdk";
import { Identifiers } from "./container.models";
import { MemoryStorage } from "./memory.storage";
import { PluginRegistry } from "./plugin-registry.service.js";
import { Profile } from "./profile";
import { ProfileImporter } from "./profile.importer";
import { ProfileRepository } from "./profile.repository";
import { ProfileSerialiser } from "./profile.serialiser";
import { Request } from "@ardenthq/sdk-fetch";
import { StubStorage } from "../test/stubs/storage";
import { WalletService } from "./wallet.service.js";
import { container } from "./container";
import { describe } from "@ardenthq/sdk-test";
import fs from "fs-extra";
import { identity } from "../test/fixtures/identity";
import { importByMnemonic } from "../test/mocking";
import { resolve } from "path";
import storageData from "../test/fixtures/env-storage.json";

const makeSubject = async (context) => {
	context.subject = new Environment({
		coins: { ARK },
		hostSelector: () => Helpers.randomNetworkHostFromConfig,
		httpClient: new Request(),
		ledgerTransportFactory: async () => {},
		storage: new StubStorage(),
	});
	await context.subject.verify();
	await context.subject.boot();
	await context.subject.persist();
};

describe("Environment", ({ beforeEach, it, assert, nock, loader }) => {
	beforeEach(() => {
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
			.get("/api/delegates")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
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
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get(/.+/)
			.query(true)
			.reply(200, (url) => ({ data: {}, meta: {} }))
			.persist();

		fs.removeSync(resolve("test/stubs/env.json"));

		container.flush();
	});

	it("should have a profile repository", async (context) => {
		await makeSubject(context);

		assert.instance(await context.subject.profiles(), ProfileRepository);
	});

	it("should have a data repository", async (context) => {
		await makeSubject(context);

		assert.instance(context.subject.data(), DataRepository);
	});

	it("should have a plugin registry", async (context) => {
		await makeSubject(context);

		assert.instance(context.subject.plugins(), PluginRegistry);
	});

	it("should have available networks", async (context) => {
		await makeSubject(context);

		assert.length(context.subject.availableNetworks(), 2);

		for (const network of context.subject.availableNetworks()) {
			assert.object(network.toObject());
		}
	});

	it("should set migrations", async (context) => {
		await makeSubject(context);

		assert.false(container.has(Identifiers.MigrationSchemas));
		assert.false(container.has(Identifiers.MigrationVersion));

		context.subject.setMigrations({}, "1.0.0");

		assert.true(container.has(Identifiers.MigrationSchemas));
		assert.true(container.has(Identifiers.MigrationVersion));
	});

	it("should create a profile with data and persist it when instructed to do so", async (context) => {
		await makeSubject(context);

		/**
		 * Save data in the current environment.
		 */

		const profile = await context.subject.profiles().create("John Doe");

		// Create a Contact
		profile.contacts().create("Jane Doe", [
			{
				address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
				coin: "ARK",
				network: "ark.devnet",
			},
		]);

		// Create a Wallet
		await importByMnemonic(profile, identity.mnemonic, "ARK", "ark.devnet");

		// Create a Notification
		profile
			.notifications()
			.releases()
			.push({
				body: "...",
				meta: { version: "3.0.0" },
				name: "Update Available",
			});

		// Create a DataEntry
		profile.data().set(ProfileData.LatestMigration, "0.0.0");

		// Create a Setting
		profile.settings().set("ADVANCED_MODE", false);

		// Create a Setting
		profile.settings().set(ProfileSetting.LastVisitedPage, { path: "test", data: { foo: "bar" } });

		// Encode all data
		await context.subject.profiles().persist(profile);

		// Create a Global DataEntry
		context.subject.data().set("KEY", "VALUE");

		// Persist the data for the next instance to use.
		await context.subject.persist();

		/**
		 * Load data that the previous environment instance saved.
		 */

		container.flush();

		const newEnvironment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});
		await newEnvironment.verify();
		await newEnvironment.boot();

		const newProfile = newEnvironment.profiles().findById(profile.id());

		assert.instance(newProfile, Profile);

		await new ProfileImporter(newProfile).import();
		await newProfile.sync();

		assert.length(newProfile.wallets().keys(), 1);
		assert.length(newProfile.contacts().keys(), 1);
		assert.is(newProfile.notifications().count(), 1);
		assert.equal(newProfile.data().all(), {
			LATEST_MIGRATION: "0.0.0",
		});
		assert.equal(newProfile.settings().all(), {
			AUTOMATIC_SIGN_OUT_PERIOD: 15,
			BIP39_LOCALE: "english",
			DO_NOT_SHOW_FEE_WARNING: false,
			EXCHANGE_CURRENCY: "BTC",
			FALLBACK_TO_DEFAULT_NODES: true,
			LOCALE: "en-US",
			MARKET_PROVIDER: "cryptocompare",
			NAME: "John Doe",
			THEME: "light",
			TIME_FORMAT: "h:mm A",
			USE_NETWORK_WALLET_NAMES: false,
			USE_TEST_NETWORKS: false,
			LAST_VISITED_PAGE: { path: "test", data: { foo: "bar" } },
		});
	});

	it("should boot the environment from fixed data", async () => {
		const environment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});
		await environment.verify(storageData);
		await environment.boot();

		const newProfile = environment.profiles().findById("8101538b-b13a-4b8d-b3d8-e710ccffd385");

		await new ProfileImporter(newProfile).import();

		assert.instance(newProfile, Profile);
		assert.length(newProfile.wallets().keys(), 1);
		assert.length(newProfile.contacts().keys(), 1);
		assert.is(newProfile.notifications().count(), 1);
		assert.equal(newProfile.data().all(), {
			LATEST_MIGRATION: "0.0.0",
		});

		assert.equal(newProfile.settings().all(), {
			AUTOMATIC_SIGN_OUT_PERIOD: 15,
			BIP39_LOCALE: "english",
			DO_NOT_SHOW_FEE_WARNING: false,
			EXCHANGE_CURRENCY: "BTC",
			FALLBACK_TO_DEFAULT_NODES: true,
			LOCALE: "en-US",
			MARKET_PROVIDER: "cryptocompare",
			NAME: "John Doe",
			THEME: "light",
			TIME_FORMAT: "h:mm A",
			USE_NETWORK_WALLET_NAMES: false,
			USE_TEST_NETWORKS: false,
		});

		const restoredWallet = newProfile.wallets().first();

		assert.equal(restoredWallet.settings().all(), {
			AVATAR: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect width="100" height="100" fill="#45A2EB"/></svg>',
		});

		assert.is(restoredWallet.alias(), undefined);
	});

	it("should boot with empty storage data", async () => {
		const environment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		assert.undefined(await environment.verify({ data: {}, profiles: storageData.profiles }));
		assert.undefined(await environment.boot());
	});

	it("should boot with empty storage profiles", async () => {
		const environment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		assert.undefined(await environment.verify({ data: { key: "value" }, profiles: {} }));
		assert.undefined(await environment.boot());
	});

	it("should boot with exchange service data", async () => {
		const environment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		container.get(Identifiers.Storage).set("EXCHANGE_RATE_SERVICE", {});

		assert.undefined(await environment.verify({ data: {}, profiles: {} }));
		assert.undefined(await environment.boot());
	});

	it("should create preselected storage given storage option as string", async () => {
		new Environment({ coins: { ARK }, httpClient: new Request(), storage: "memory" });

		assert.instance(container.get(Identifiers.Storage), MemoryStorage);
	});

	it("should throw error when calling boot without verify first", async () => {
		const environment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		await assert.rejects(() => environment.boot(), "Please call [verify] before booting the environment.");
	});

	it("#exchangeRates", async (context) => {
		await makeSubject(context);

		assert.instance(context.subject.exchangeRates(), ExchangeRateService);
	});

	it("#fees", async (context) => {
		await makeSubject(context);

		await context.subject.fees().sync(await context.subject.profiles().create("John"), "ARK", "ark.devnet");

		assert.length(Object.keys(context.subject.fees().all("ARK", "ark.devnet")), 10);
	});

	it("#delegates", async (context) => {
		await makeSubject(context);

		await context.subject.delegates().sync(await context.subject.profiles().create("John"), "ARK", "ark.devnet");

		assert.length(context.subject.delegates().all("ARK", "ark.devnet"), 200);
	});

	it("#knownWallets", async (context) => {
		await makeSubject(context);

		await context.subject.knownWallets().syncAll(await context.subject.profiles().create("John Doe"));

		assert.false(context.subject.knownWallets().is("ark.devnet", "unknownWallet"));
	});

	it("#wallets", async (context) => {
		await makeSubject(context);

		assert.instance(context.subject.wallets(), WalletService);
	});

	// it("should register a coin and deregister it", async () => {
	// 	const environment = new Environment({
	// 		coins: { ARK },
	// 		httpClient: new Request(),
	// 		ledgerTransportFactory: async () => {},
	// 		storage: new StubStorage(),
	// 	});
	// 	await environment.verify(storageData);
	// 	await environment.boot();

	// 	environment.registerCoin("BTC", BTC);
	// 	assert.throws(() => environment.registerCoin("BTC", BTC), /is already registered/);
	// 	assert.not.throws(() => environment.deregisterCoin("BTC"));
	// });

	it("should fail verification", async () => {
		const environment = new Environment({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});

		await assert.rejects(
			() => environment.verify({ data: {}, profiles: [] }),
			'Terminating due to corrupted state: ValidationError: "profiles" must be of type object',
		);
	});

	it("should create a profile with password and persist", async (context) => {
		await makeSubject(context);

		const profile = await context.subject.profiles().create("John Doe");
		profile.auth().setPassword("password");

		assert.true(profile.status().isDirty());

		await context.subject.persist();

		assert.false(profile.status().isDirty());
	});

	it("should flush all bindings", async (context) => {
		container.constant("test", true);
		context.subject.reset();
		assert.throws(() => container.get("test"));
	});

	it("should flush all bindings and rebind them", async (context) => {
		await makeSubject(context);

		assert.not.throws(() => container.get(Identifiers.Storage));

		context.subject.reset({ coins: { ARK }, httpClient: new Request(), storage: new StubStorage() });

		assert.not.throws(() => container.get(Identifiers.Storage));
	});

	it("should persist the env and restore it", async (context) => {
		// Create initial environment
		await makeSubject(context);

		const john = await context.subject.profiles().create("John");

		await importByMnemonic(john, identity.mnemonic, "ARK", "ark.devnet");
		await context.subject.profiles().persist(john);

		const jane = await context.subject.profiles().create("Jane");
		jane.auth().setPassword("password");
		await context.subject.profiles().persist(jane);

		const jack = await context.subject.profiles().create("Jack");
		jack.auth().setPassword("password");
		await context.subject.profiles().persist(jack);

		await context.subject.persist();

		// Boot new env after we persisted the data
		context.subject.reset({
			coins: { ARK },
			httpClient: new Request(),
			ledgerTransportFactory: async () => {},
			storage: new StubStorage(),
		});
		await context.subject.verify();
		await context.subject.boot();

		// Assert that we got back what we dumped in the previous env
		const restoredJohn = context.subject.profiles().findById(john.id());
		await new ProfileImporter(restoredJohn).import();
		await restoredJohn.sync();

		const restoredJane = context.subject.profiles().findById(jane.id());
		await new ProfileImporter(restoredJane).import("password");
		await restoredJane.sync();

		const restoredJack = context.subject.profiles().findById(jack.id());
		await new ProfileImporter(restoredJack).import("password");
		await restoredJack.sync();

		assert.equal(new ProfileSerialiser(restoredJohn).toJSON(), new ProfileSerialiser(john).toJSON());
		assert.equal(new ProfileSerialiser(restoredJane).toJSON(), new ProfileSerialiser(jane).toJSON());
		assert.equal(new ProfileSerialiser(restoredJack).toJSON(), new ProfileSerialiser(jack).toJSON());
	});
});
