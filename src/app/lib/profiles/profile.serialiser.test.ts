import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, generateWallet, importByAddressWithDerivationPath, importByMnemonic } from "../test/mocking";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ProfileSerialiser } from "./profile.serialiser";

describe("ProfileSerialiser", ({ it, assert, loader, beforeEach, nock }) => {
	beforeEach((context) => {
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

		context.profile = new Profile({ data: "", id: "uuid", name: "name" });
		context.subject = new ProfileSerialiser(context.profile);

		context.profile.settings().set(ProfileSetting.Name, "John Doe");
	});

	it("should turn into an object", (context) => {
		assert.object(context.subject.toJSON());
	});

	it("should not exclude anything", async (context) => {
		await importByMnemonic(context.profile, identity.mnemonic, "ARK", "ark.devnet");

		const filtered = context.subject.toJSON({
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
			saveGeneralSettings: true,
		});

		assert.length(Object.keys(filtered.wallets), 1);
	});

	it("should exclude empty wallets", async (context) => {
		await generateWallet(context.profile, "ARK", "ark.devnet");
		const filtered = context.subject.toJSON({
			addNetworkInformation: true,
			excludeEmptyWallets: true,
			excludeLedgerWallets: false,
			saveGeneralSettings: true,
		});

		assert.length(Object.keys(filtered.wallets), 0);
	});

	it("should exclude ledger wallets", async (context) => {
		await importByAddressWithDerivationPath(context.profile, identity.address, "ARK", "ark.devnet", "m/44");

		const filtered = context.subject.toJSON({
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: true,
			saveGeneralSettings: true,
		});

		assert.length(Object.keys(filtered.wallets), 0);
	});

	it("should not include network information", async (context) => {
		await importByMnemonic(context.profile, identity.mnemonic, "ARK", "ark.devnet");

		assert.throws(
			() =>
				context.subject.toJSON({
					addNetworkInformation: false,
					excludeEmptyWallets: false,
					excludeLedgerWallets: false,
					saveGeneralSettings: true,
				}),
			"This is not implemented yet",
		);
	});

	it("should not include general settings", async (context) => {
		assert.throws(
			() =>
				context.subject.toJSON({
					addNetworkInformation: true,
					excludeEmptyWallets: false,
					excludeLedgerWallets: false,
					saveGeneralSettings: false,
				}),
			"This is not implemented yet",
		);
	});
});
