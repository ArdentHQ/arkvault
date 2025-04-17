import { Base64 } from "@ardenthq/sdk-cryptography";
import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { ProfileData, ProfileSetting } from "./contracts";
import { Migrator } from "./migrator";
import { Profile } from "./profile";
import { ProfileImporter } from "./profile.importer";
import { ProfileSerialiser } from "./profile.serialiser";

describe("Migrator", ({ beforeEach, it, assert }) => {
	beforeEach(async (context) => {
		bootContainer();

		context.profile = new Profile({ avatar: "avatar", data: Base64.encode("{}"), id: "id", name: "name" });
		context.subject = new Migrator(context.profile, {});
	});

	it("should save the project version as the initial migrated version", async (context) => {
		await context.subject.migrate({}, "0.0.2");

		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.2");
	});

	it("should save the project version when a migration occurs", async (context) => {
		const migrations = {
			"0.0.3": async ({ profile }) => profile.data().set("key", "value"),
		};

		await context.subject.migrate(migrations, "0.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.2");

		await context.subject.migrate(migrations, "0.0.4");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.4");
		assert.is(context.profile.data().get("key"), "value");
	});

	it("should not run the migration when the version does not change", async (context) => {
		const migrations = {
			"1.0.0": async ({ profile }) => profile.data().set("key", "value"),
		};

		await context.subject.migrate(migrations, "0.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.2");
		assert.false(context.profile.data().has("key"));

		await context.subject.migrate(migrations, "0.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.2");
		assert.false(context.profile.data().has("key"));
	});

	it("should run migration when previous version is less but not zero", async (context) => {
		const migrations = {
			"0.0.3": async ({ profile }) => profile.data().set("key", "value"),
		};

		context.profile.data().get(ProfileData.LatestMigration, "0.0.1");
		await context.subject.migrate(migrations, "0.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.2");
	});

	it("should run the migration when the version changes", async (context) => {
		const migrations = {
			"1.0.0": async ({ profile }) => profile.data().set("key", "value"),
		};

		await context.subject.migrate(migrations, "0.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "0.0.2");
		assert.false(context.profile.data().has("key"));

		await context.subject.migrate(migrations, "1.1.0");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "1.1.0");
		assert.true(context.profile.data().has("key"));
		assert.is(context.profile.data().get("key"), "value");
	});

	it("should run the migration when the version uses semver comparisons", async (context) => {
		const migrations = {
			">=1.0": async ({ profile }) => profile.data().set("key", "value"),
		};

		await context.subject.migrate(migrations, "1.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "1.0.2");
		assert.is(context.profile.data().get("key"), "value");
	});

	it("should run the migration when the version uses multiple semver comparisons", async (context) => {
		const migrations = {
			">2.0.0": async ({ profile }) => profile.data().set("key", "new value"),
			">=1.0": async ({ profile }) => profile.data().set("key", "value"),
		};

		await context.subject.migrate(migrations, "1.0.2");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "1.0.2");
		assert.is(context.profile.data().get("key"), "value");

		await context.subject.migrate(migrations, "2.0.1");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "2.0.1");
		assert.is(context.profile.data().get("key"), "new value");
	});

	it("should run all valid migrations when the version uses multiple semver comparisons", async (context) => {
		const migrations = {
			"<3.0.0": async ({ profile }) => {
				await profile.data().set("key4", "value4");
				await profile.data().set("key5", "value5");
			},
			">2.0.0": async ({ profile }) => {
				await profile.data().set("key2", "value2");
				await profile.data().set("key3", "value3");
			},
			">=1.0": async ({ profile }) => profile.data().set("key1", "value1"),
		};

		await context.subject.migrate(migrations, "2.4.0");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "2.4.0");
		assert.is(context.profile.data().get("key1"), "value1");
		assert.is(context.profile.data().get("key2"), "value2");
		assert.is(context.profile.data().get("key3"), "value3");
		assert.is(context.profile.data().get("key4"), "value4");
		assert.is(context.profile.data().get("key5"), "value5");
	});

	it("should cleanup migrations with non-numeric values", async (context) => {
		const migrations = {
			"1.0.1-alpha": async ({ profile }) => profile.data().set("key1", "value1"),
			"<3.0.0": async ({ profile }) => {
				await profile.data().set("key4", "value4");
				await profile.data().set("key5", "value5");
			},
			">2.0.0-beta": async ({ profile }) => {
				await profile.data().set("key2", "value2");
				await profile.data().set("key3", "value3");
			},
		};

		await context.subject.migrate(migrations, "2.4.0");
		assert.is(context.profile.data().get(ProfileData.LatestMigration), "2.4.0");
		assert.is(context.profile.data().get("key1"), "value1");
		assert.is(context.profile.data().get("key2"), "value2");
		assert.is(context.profile.data().get("key3"), "value3");
		assert.is(context.profile.data().get("key4"), "value4");
		assert.is(context.profile.data().get("key5"), "value5");
	});

	it("should rollback changes if a migration failed", async (context) => {
		const failingMigrations = {
			"1.0.0": async ({ profile }) => profile.data().set("key", "initial update"),
			"1.0.1": async ({ profile }) => {
				await profile.data().set("key", "updated before crash");

				throw new Error("throw the migration and rollback");

				await profile.data().set("key", "unreachable");
			},
		};

		const passingMigrations = {
			"1.0.0": async ({ profile }) => profile.data().set("key", "initial update"),
		};

		await context.subject.migrate(passingMigrations, "1.0.0");

		await assert.rejects(
			() => context.subject.migrate(failingMigrations, "1.0.2"),
			"throw the migration and rollback",
		);

		assert.is(context.profile.data().get(ProfileData.LatestMigration), "1.0.0");
		assert.is(context.profile.data().get("key"), "initial update");
	});

	it("should migrate profiles from JSON to Base64", async (context) => {
		context.profile = new Profile({
			// @ts-ignore
			data: {
				contacts: {
					"0e147f96-049f-4d89-bad4-ad3341109907": {
						addresses: [
							{
								address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
								coin: "ARK",
								id: "403a2b1a-8f0a-4351-9e86-1e50da063de0",
								network: "ark.devnet",
							},
						],
						id: "0e147f96-049f-4d89-bad4-ad3341109907",
						name: "Jane Doe",
						starred: false,
					},
				},
				data: {
					key: "value",
				},
				exchangeTransactions: {},
				notifications: {
					"b183aef3-2dba-471a-a588-0fcf8f01b645": {
						action: "Read Changelog",
						body: "...",
						icon: "warning",
						id: "b183aef3-2dba-471a-a588-0fcf8f01b645",
						name: "Ledger Update Available",
						type: "type",
					},
				},
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
					[ProfileSetting.Password]:
						"$argon2id$v=19$m=16,t=2,p=1$S09reTl2S1NTVllrU2ZuMg$Efpf9GGOgXdDmFmW1eF1Ew",
					[ProfileSetting.Theme]: "dark",
					[ProfileSetting.TimeFormat]: "HH::MM",
					[ProfileSetting.UseNetworkWalletNames]: false,
					[ProfileSetting.UseTestNetworks]: false,
				},
				wallets: {
					// Skip wallets for this test since we only care if the data was turned into base64, no need for network mocking.
				},
			},
			id: "b999d134-7a24-481e-a95d-bc47c543bfc9",
		});

		context.subject = new Migrator(context.profile, {});

		await context.subject.migrate(
			{
				"2.0.0": async ({ profile }) => {
					const profileData = profile.getAttributes().all();
					profileData.data.contacts["0e147f96-049f-4d89-bad4-ad3341109907"].name = "John Doe";
					profileData.data.contacts["0e147f96-049f-4d89-bad4-ad3341109907"].addresses = [
						{
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							coin: "ARK",
							id: "403a2b1a-8f0a-4351-9e86-1e50da063de0",
							network: "ark.devnet",
						},
					];

					profile.getAttributes().setMany({
						data: Base64.encode(JSON.stringify({ id: profile.id(), ...profileData.data })),
						id: profile.id(),
						name: profile.data.name,
						password: profileData.data.settings.PASSWORD,
					});
				},
			},
			"2.0.0",
		);

		assert.is(context.profile.data().get(ProfileData.LatestMigration), "2.0.0");

		await new ProfileImporter(context.profile).import();

		assert.is(context.profile.id(), "b999d134-7a24-481e-a95d-bc47c543bfc9");
		assert.true(context.profile.usesPassword());
		assert.is(context.profile.contacts().findById("0e147f96-049f-4d89-bad4-ad3341109907").name(), "John Doe");
		assert.object(new ProfileSerialiser(context.profile).toJSON());
	});
});
