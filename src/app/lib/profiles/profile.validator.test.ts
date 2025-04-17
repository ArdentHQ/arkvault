import { Base64 } from "@ardenthq/sdk-cryptography";
import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ProfileDumper } from "./profile.dumper";
import { ProfileImporter } from "./profile.importer";
import { ProfileValidator } from "./profile.validator";

describe("ProfileValidator", ({ loader, it, assert, nock, beforeEach }) => {
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
		context.dumper = new ProfileDumper(context.profile);
	});

	it("should successfully validate profile data", async (context) => {
		const validProfileData = {
			contacts: {
				"448042c3-a405-4895-970e-a33c6e907905": {
					addresses: [
						{
							address: "test",
							coin: "ARK",
							id: "3a7a9e03-c10b-4135-88e9-92e586d53e69",
						},
						{
							address: "test",
							coin: "ARK",
							id: "dfc3a16d-47b8-47f2-9b6f-fe4b8365a64a",
						},
					],
					id: "448042c3-a405-4895-970e-a33c6e907905",
					name: "John",
					starred: false,
				},
			},
			data: { key: "value" },
			exchangeTransactions: {},
			hosts: {},
			id: "uuid",
			networks: {},
			notifications: {},
			plugins: {
				data: {},
			},
			settings: {
				[ProfileSetting.AutomaticSignOutPeriod]: 60,
				[ProfileSetting.Bip39Locale]: "english",
				[ProfileSetting.DoNotShowFeeWarning]: false,
				[ProfileSetting.FallbackToDefaultNodes]: true,
				[ProfileSetting.ExchangeCurrency]: "ADA",
				[ProfileSetting.Locale]: "en-US",
				[ProfileSetting.MarketProvider]: "coingecko",
				[ProfileSetting.Name]: "John Doe",
				[ProfileSetting.Theme]: "dark",
				[ProfileSetting.TimeFormat]: "HH::MM",
				[ProfileSetting.UseNetworkWalletNames]: false,
				[ProfileSetting.UseTestNetworks]: false,
				[ProfileSetting.LastVisitedPage]: { data: { foo: "bar" }, path: "test" },
				[ProfileSetting.Sessions]: { 1: { data: { foo: "bar" }, name: "test" } },
			},
			wallets: {},
		};

		const validator = new ProfileValidator();

		assert.equal(validator.validate(validProfileData).settings, validProfileData.settings);
	});

	it("should fail to validate", async (context) => {
		const corruptedProfileData = {
			// id: 'uuid',
			contacts: {},
			data: {},
			exchangeTransactions: {},
			hosts: {},
			networks: {},
			notifications: {},
			plugins: { data: {} },
			settings: { NAME: "John Doe" },
			wallets: {},
		};

		new Profile({
			avatar: "avatar",
			data: Base64.encode(JSON.stringify(corruptedProfileData)),
			id: "uuid",
			name: "name",
			password: undefined,
		});

		const validator = new ProfileValidator();

		assert.throws(() => validator.validate(corruptedProfileData));
	});

	it("should apply migrations if any are set", async (context) => {
		// @TODO use spy.
		let callCount = 0;

		const migrationFunction = () => callCount++;
		const migrations = { "1.0.1": migrationFunction };

		container.constant(Identifiers.MigrationSchemas, migrations);
		container.constant(Identifiers.MigrationVersion, "1.0.2");

		const subject = new ProfileImporter(new Profile(context.dumper.dump()));

		await subject.import();

		assert.true(callCount > 0);
	});
});
