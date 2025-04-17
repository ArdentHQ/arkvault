import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { Authenticator } from "./authenticator";
import { ContactRepository } from "./contact.repository";
import { ProfileData, ProfileSetting } from "./contracts";
import { CountAggregate } from "./count.aggregate";
import { DataRepository } from "./data.repository";
import { ExchangeTransactionRepository } from "./exchange-transaction.repository";
import { ProfileNotificationService } from "./notification.service.js";
import { PluginRepository } from "./plugin.repository";
import { Profile } from "./profile";
import { RegistrationAggregate } from "./registration.aggregate";
import { SettingRepository } from "./setting.repository";
import { TransactionAggregate } from "./transaction.aggregate";
import { WalletAggregate } from "./wallet.aggregate";
import { WalletFactory } from "./wallet.factory.js";
import { WalletRepository } from "./wallet.repository";

describe("Profile", ({ beforeEach, it, assert, loader, stub, nock }) => {
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

		context.subject = new Profile({ data: "", id: "uuid", name: "name" });
		context.subject.settings().set(ProfileSetting.Name, "John Doe");
	});

	it("should have an id", (context) => {
		assert.is(context.subject.id(), "uuid");
	});

	it("should have a name", (context) => {
		assert.is(context.subject.name(), "John Doe");
	});

	it("should have a default theme", (context) => {
		assert.is(context.subject.appearance().get("theme"), "light");
	});

	it("should have a custom theme", (context) => {
		context.subject.settings().set(ProfileSetting.Theme, "dark");

		assert.is(context.subject.appearance().get("theme"), "dark");
	});

	it("should have a default avatar", (context) => {
		assert.string(context.subject.avatar());
	});

	it("should have a custom avatar", (context) => {
		context.subject.settings().set(ProfileSetting.Avatar, "custom-avatar");

		assert.is(context.subject.avatar(), "custom-avatar");
	});

	it("should have a last visited page", (context) => {
		const lastVisitedPage = {
			path: "/test",
			data: { foo: "bar" },
		};

		context.subject.settings().set(ProfileSetting.LastVisitedPage, lastVisitedPage);

		assert.is(context.subject.settings().get(ProfileSetting.LastVisitedPage), lastVisitedPage);
	});

	it("should have sessions", (context) => {
		const sessions = {
			"1": {
				name: "test",
				data: { foo: "bar" },
			},
		};

		context.subject.settings().set(ProfileSetting.Sessions, sessions);
		assert.is(context.subject.settings().get(ProfileSetting.Sessions), sessions);
	});

	it("should have a custom avatar in data", (context) => {
		context.subject.getAttributes().set("data.avatar", "something");
		context.subject.getAttributes().set("avatar", "custom-avatar");

		assert.is(context.subject.avatar(), "custom-avatar");
	});

	it("should have a balance", (context) => {
		assert.is(context.subject.balance(), 0);
	});

	it("should have a converted balance", (context) => {
		assert.is(context.subject.convertedBalance(), 0);
	});

	it("should have a contacts repository", (context) => {
		assert.instance(context.subject.contacts(), ContactRepository);
	});

	it("should have a data repository", (context) => {
		assert.instance(context.subject.data(), DataRepository);
	});

	it("should have a exchange transactions repository", (context) => {
		assert.instance(context.subject.exchangeTransactions(), ExchangeTransactionRepository);
	});

	it("should have a notifications repository", (context) => {
		assert.instance(context.subject.notifications(), ProfileNotificationService);
	});

	it("should have a plugins repository", (context) => {
		assert.instance(context.subject.plugins(), PluginRepository);
	});

	it("should have a settings repository", (context) => {
		assert.instance(context.subject.settings(), SettingRepository);
	});

	it("should have a wallets repository", (context) => {
		assert.instance(context.subject.wallets(), WalletRepository);
	});

	it("should flush all data", (context) => {
		assert.length(context.subject.settings().keys(), 1);

		context.subject.flush();

		assert.length(context.subject.settings().keys(), 12);
	});

	it("should fail to flush all data if the name is missing", (context) => {
		context.subject.settings().forget(ProfileSetting.Name);

		assert.length(context.subject.settings().keys(), 0);

		assert.throws(
			() => context.subject.flush(),
			"The name of the profile could not be found. This looks like a bug.",
		);
	});

	it("should flush settings", (context) => {
		assert.length(context.subject.settings().keys(), 1);

		context.subject.flushSettings();

		assert.length(context.subject.settings().keys(), 12);
	});

	it("should fail to flush settings if the name is missing", (context) => {
		context.subject.settings().forget(ProfileSetting.Name);

		assert.length(context.subject.settings().keys(), 0);

		assert.throws(
			() => context.subject.flushSettings(),
			"The name of the profile could not be found. This looks like a bug.",
		);
	});

	it("should have a wallet factory", (context) => {
		assert.instance(context.subject.walletFactory(), WalletFactory);
	});

	it("should have a count aggregate", (context) => {
		assert.instance(context.subject.countAggregate(), CountAggregate);
	});

	it("should have a registration aggregate", (context) => {
		assert.instance(context.subject.registrationAggregate(), RegistrationAggregate);
	});

	it("should have a transaction aggregate", (context) => {
		assert.instance(context.subject.transactionAggregate(), TransactionAggregate);
	});

	it("should have a wallet aggregate", (context) => {
		assert.instance(context.subject.walletAggregate(), WalletAggregate);
	});

	it("should have an authenticator", (context) => {
		assert.instance(context.subject.auth(), Authenticator);
	});

	it("should determine if the password uses a password", (context) => {
		assert.false(context.subject.usesPassword());

		context.subject.auth().setPassword("password");

		assert.true(context.subject.usesPassword());
	});

	it("#hasBeenPartiallyRestored", async (context) => {
		stub(context.subject, "hasBeenPartiallyRestored").returnValue(true);

		context.subject.wallets().push({
			address: () => "",
			id: () => "",
			networkId: () => "",
		});

		assert.true(context.subject.hasBeenPartiallyRestored());
	});

	it("should mark the introductory tutorial as completed", (context) => {
		assert.false(context.subject.hasCompletedIntroductoryTutorial());

		context.subject.markIntroductoryTutorialAsComplete();

		assert.true(context.subject.hasCompletedIntroductoryTutorial());
	});

	it("should determine if the introductory tutorial has been completed", (context) => {
		assert.false(context.subject.hasCompletedIntroductoryTutorial());

		context.subject.data().set(ProfileData.HasCompletedIntroductoryTutorial, true);

		assert.true(context.subject.hasCompletedIntroductoryTutorial());
	});

	it("should mark the manual installation disclaimer as accepted", (context) => {
		assert.false(context.subject.hasAcceptedManualInstallationDisclaimer());

		context.subject.markManualInstallationDisclaimerAsAccepted();

		assert.true(context.subject.hasAcceptedManualInstallationDisclaimer());
	});

	it("should determine if the manual installation disclaimer has been accepted", (context) => {
		assert.false(context.subject.hasAcceptedManualInstallationDisclaimer());

		context.subject.data().set(ProfileData.HasAcceptedManualInstallationDisclaimer, true);

		assert.true(context.subject.hasAcceptedManualInstallationDisclaimer());
	});
});
