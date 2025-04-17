import { Base64 } from "@ardenthq/sdk-cryptography";
import { describeWithContext } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ProfileDumper } from "./profile.dumper";
import { ProfileImporter } from "./profile.importer";
import { ProfileRepository } from "./profile.repository";
import { ProfileSerialiser } from "./profile.serialiser";

describeWithContext(
	"ProfileImporter",
	{
		profileWithWallets: {
			contacts: {
				"448042c3-a405-4895-970e-a33c6e907905": {
					addresses: [
						{
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							coin: "ARK",
							id: "3a7a9e03-c10b-4135-88e9-92e586d53e69",
							network: "ark.devnet",
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
			},
			wallets: {
				"88ff9e53-7d40-420d-8f39-9f24acee2164": {
					data: {
						ADDRESS: "D6Z26L69gdk9qYmTv5uzk3uGepigtHY4ax",
						BALANCE: {},
						COIN: "ARK",
						NETWORK: "ark.devnet",
						PUBLIC_KEY: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
						SEQUENCE: {},
					},
					id: "88ff9e53-7d40-420d-8f39-9f24acee2164",
					settings: {
						AVATAR: "...",
					},
				},
				"ac38fe6d-4b67-4ef1-85be-17c5f6841129": {
					data: {
						ADDRESS: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
						BALANCE: {},
						COIN: "ARK",
						NETWORK: "ark.devnet",
						PUBLIC_KEY: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
						SEQUENCE: {},
					},
					id: "ac38fe6d-4b67-4ef1-85be-17c5f6841129",
					settings: {
						ALIAS: "Johnathan Doe",
						AVATAR: "...",
					},
				},
			},
		},
	},
	({ it, assert, nock, loader, beforeEach, beforeAll, stub }) => {
		beforeAll(() => {
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
		});

		beforeEach(async (context) => {
			bootContainer();

			container.get(Identifiers.ProfileRepository).flush();

			context.profile = await container.get(Identifiers.ProfileRepository).create("John Doe");
			context.subject = new ProfileImporter(context.profile);
			context.dumper = new ProfileDumper(context.profile);
			context.serialiser = new ProfileSerialiser(context.profile);
			context.repository = new ProfileRepository();
		});

		it("should restore a profile with a password", async (context) => {
			context.profile.auth().setPassword("password");

			await context.repository.persist(context.profile);

			const profileCopy = new Profile(context.dumper.dump());

			await importByMnemonic(profileCopy, identity.mnemonic, "ARK", "ark.devnet");

			const serialiser = new ProfileSerialiser(profileCopy);

			await context.subject.import("password");
			await profileCopy.sync();

			assert.containKeys(serialiser.toJSON(), [
				"contacts",
				"data",
				"exchangeTransactions",
				"notifications",
				"plugins",
				"data",
				"settings",
				"wallets",
			]);
		});

		it("should fail to restore a profile with corrupted data", async (context) => {
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

			const profile = new Profile({
				avatar: "avatar",
				data: Base64.encode(JSON.stringify(corruptedProfileData)),
				id: "uuid",
				name: "name",
				password: undefined,
			});

			const subject = new ProfileImporter(profile);

			await assert.rejects(() => subject.import());
		});

		it("should restore a profile without a password", async (context) => {
			const profileCopy = new Profile(context.dumper.dump());

			const subject = new ProfileImporter(profileCopy);

			await subject.import();

			assert.equal(new ProfileSerialiser(context.profile).toJSON(), new ProfileSerialiser(profileCopy).toJSON());
		});

		it("should fail to restore if profile is not using password but password is passed", async (context) => {
			const profileCopy = new Profile(context.dumper.dump());

			const subject = new ProfileImporter(profileCopy);

			await assert.rejects(
				() => subject.import("password"),
				"Failed to decode or decrypt the profile. Reason: This profile does not use a password but password was passed for decryption",
			);
		});

		it("should fail to restore a profile with a password if no password was provided", async (context) => {
			context.profile.auth().setPassword("password");

			await context.repository.persist(context.profile);

			const profileCopy = new Profile(context.dumper.dump());

			const subject = new ProfileImporter(profileCopy);

			await assert.rejects(() => subject.import(), "Failed to decode or decrypt the profile.");
		});

		it("should fail to restore a profile with a password if an invalid password was provided", async (context) => {
			context.profile.auth().setPassword("password");

			const profileCopy = new Profile(context.dumper.dump());

			const subject = new ProfileImporter(profileCopy);

			await assert.rejects(() => subject.import("invalid-password"), "Failed to decode or decrypt the profile.");
		});

		it("should restore a profile with wallets and contacts", async (context) => {
			const profileDump = {
				avatar: "avatar",
				data: Base64.encode(JSON.stringify(context.profileWithWallets)),
				id: "uuid",
				name: "name",
				password: undefined,
			};

			const profile = new Profile(profileDump);
			const subject = new ProfileImporter(profile);
			await subject.import();

			assert.is(profile.wallets().values().length, 2);
			assert.is(profile.wallets().valuesWithCoin().length, 2);
			assert.is(profile.contacts().count(), 1);
			assert.is(profile.contacts().first().addresses().count(), 1);
			assert.is(profile.settings().get(ProfileSetting.Theme), "dark");
		});

		it("should restore a profile with wallets of unavailable coins", async (context) => {
			const profileDump = {
				avatar: "avatar",
				data: Base64.encode(JSON.stringify(context.profileWithWallets)),
				id: "uuid",
				name: "name",
				password: undefined,
			};

			const coin = container.get(Identifiers.Coins)["ARK"];
			delete container.get(Identifiers.Coins)["ARK"];

			const profile = new Profile(profileDump);
			const subject = new ProfileImporter(profile);
			await subject.import();

			assert.is(profile.wallets().values().length, 2);
			assert.is(profile.wallets().valuesWithCoin().length, 0);

			assert.is(profile.contacts().count(), 1);
			assert.is(profile.contacts().first().addresses().count(), 1);
			assert.is(profile.settings().get(ProfileSetting.Theme), "dark");

			container.get(Identifiers.Coins)["ARK"] = coin;
		});

		it("should apply migrations if any are set", async (context) => {
			// @TODO use something like sinon.spy() instead.
			let callCount = 0;

			const migrationFunction = () => callCount++;
			const migrations = { "1.0.1": migrationFunction };

			container.constant(Identifiers.MigrationSchemas, migrations);
			container.constant(Identifiers.MigrationVersion, "1.0.2");

			const subject = new ProfileImporter(new Profile(context.dumper.dump()));

			await subject.import();

			assert.true(callCount > 0);
		});
	},
);
