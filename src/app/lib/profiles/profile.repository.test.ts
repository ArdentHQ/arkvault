import { readFileSync } from "fs";
import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { PROFILE_BLANK, PROFILE_PASSWORD } from "../test/profiles";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { Profile } from "./profile";
import { ProfileImporter } from "./profile.importer";
import { ProfileRepository } from "./profile.repository";
import { ProfileSerialiser } from "./profile.serialiser";

describe("ProfileRepository", ({ it, assert, beforeEach, loader, nock, stub }) => {
	beforeEach((context) => {
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
			.persist();

		context.subject = new ProfileRepository();

		if (container.has(Identifiers.ProfileRepository)) {
			container.unbind(Identifiers.ProfileRepository);
		}

		container.constant(Identifiers.ProfileRepository, context.subject);
	});

	it("should restore the given profiles", async (context) => {
		assert.is(context.subject.count(), 0);

		context.subject.fill({
			"b999d134-7a24-481e-a95d-bc47c543bfc9": {
				contacts: {
					"0e147f96-049f-4d89-bad4-ad3341109907": {
						addresses: [],
						id: "0e147f96-049f-4d89-bad4-ad3341109907",
						name: "Jane Doe",
						starred: false,
					},
				},
				data: {
					key: "value",
				},
				exchangeTransactions: {},
				hosts: {},
				id: "b999d134-7a24-481e-a95d-bc47c543bfc9",
				networks: {},
				notifications: {
					"b183aef3-2dba-471a-a588-0fcf8f01b645": {
						action: "Read Changelog",
						body: "...",
						icon: "warning",
						id: "b183aef3-2dba-471a-a588-0fcf8f01b645",
						name: "Ledger Update Available",
					},
				},
				plugins: {
					data: {},
				},
				settings: {
					ADVANCED_MODE: "value",
					NAME: "John Doe",
				},
				wallets: {
					"0e147f96-049f-4d89-bad4-ad3341109907": {
						address: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9",
						coin: "ARK",
						data: {
							BALANCE: {},
							SEQUENCE: {},
						},
						id: "0e147f96-049f-4d89-bad4-ad3341109907",
						network: "ark.devnet",
						publicKey: "03bbfb43ecb5a54a1e227bb37b5812b5321213838d376e2b455b6af78442621dec",
						settings: {
							ALIAS: "Jane Doe",
							AVATAR: "...",
						},
					},
					"ac38fe6d-4b67-4ef1-85be-17c5f6841129": {
						address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
						coin: "ARK",
						data: {
							BALANCE: {},
							SEQUENCE: {},
						},
						id: "ac38fe6d-4b67-4ef1-85be-17c5f6841129",
						network: "ark.devnet",
						publicKey: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
						settings: {
							ALIAS: "Johnathan Doe",
							AVATAR: "...",
						},
					},
				},
			},
		});

		assert.is(context.subject.count(), 1);
	});

	it("should push, get, list and forget any given profiles", async (context) => {
		assert.is(context.subject.count(), 0);

		const john = await context.subject.create("John");

		assert.is(context.subject.count(), 1);
		assert.instance(context.subject.findById(john.id()), Profile);

		const jane = await context.subject.create("Jane");

		assert.is(context.subject.count(), 2);
		assert.instance(context.subject.findById(jane.id()), Profile);
		assert.instance(context.subject.findByName(jane.name()), Profile);
		assert.true(context.subject.has(jane.id()));

		context.subject.forget(jane.id());

		assert.is(context.subject.count(), 1);
		assert.false(context.subject.has(jane.id()));
		assert.throws(() => context.subject.findById(jane.id()), "No profile found for");
	});

	it("should get all profiles", async (context) => {
		await context.subject.create("John");
		await context.subject.create("Jane");

		assert.length(Object.keys(context.subject.all()), 2);
	});

	it("should get all keys", async (context) => {
		await context.subject.create("John");
		await context.subject.create("Jane");

		assert.length(context.subject.keys(), 2);
	});

	it("should get all values", async (context) => {
		await context.subject.create("John");
		await context.subject.create("Jane");

		assert.length(context.subject.values(), 2);
	});

	it("should forget all values", async (context) => {
		await context.subject.create("Jane");

		assert.length(context.subject.values(), 1);

		context.subject.flush();

		assert.length(context.subject.values(), 0);
	});

	it("should get the first and last profile", async (context) => {
		const john = await context.subject.create("John");
		const jane = await context.subject.create("Jane");

		assert.is(context.subject.first(), john);
		assert.is(context.subject.last(), jane);
	});

	it("should fail to push a profile with a duplicate name", async (context) => {
		await context.subject.create("John");

		await assert.rejects(() => context.subject.create("John"), "The profile [John] already exists.");
	});

	it("should fail to forget a profile that doesn't exist", async (context) => {
		assert.throws(() => context.subject.forget("doesnotexist"), "No profile found for");
	});

	it("should dump profiles without a password", async (context) => {
		const john = await context.subject.create("John");

		await importByMnemonic(john, identity.mnemonic, "ARK", "ark.devnet");

		await context.subject.persist(john);

		const repositoryDump = context.subject.toObject();

		const restoredJohn = new Profile(repositoryDump[john.id()]);
		await new ProfileImporter(restoredJohn).import();
		await restoredJohn.sync();

		assert.equal(new ProfileSerialiser(restoredJohn).toJSON(), new ProfileSerialiser(john).toJSON());
	});

	it("should dump profiles with a password", async (context) => {
		const jane = await context.subject.create("Jane");

		await importByMnemonic(jane, identity.mnemonic, "ARK", "ark.devnet");

		jane.password().set("password");
		jane.auth().setPassword("password");

		await context.subject.persist(jane);

		const repositoryDump = context.subject.toObject();

		const restoredJane = new Profile(repositoryDump[jane.id()]);
		await new ProfileImporter(restoredJane).import("password");
		await restoredJane.sync();

		assert.equal(new ProfileSerialiser(restoredJane).toJSON(), new ProfileSerialiser(jane).toJSON());
	});

	it("should export ok", async (context) => {
		const profile = await context.subject.create("John");
		await importByMnemonic(profile, identity.mnemonic, "ARK", "ark.devnet");

		const exported = await context.subject.export(profile, {
			addNetworkInformation: true,
			excludeEmptyWallets: false,
			excludeLedgerWallets: false,
			saveGeneralSettings: true,
		});

		assert.string(exported);
	});

	it("should export ok with password", async (context) => {
		const profile = await context.subject.create("John");
		profile.auth().setPassword("some pass");
		await importByMnemonic(profile, identity.mnemonic, "ARK", "ark.devnet");

		const exported = await context.subject.export(
			profile,
			{
				addNetworkInformation: true,
				excludeEmptyWallets: false,
				excludeLedgerWallets: false,
				saveGeneralSettings: true,
			},
			"some pass",
		);

		assert.string(exported);
	});

	it("should import ok", async (context) => {
		const wweFileContents = readFileSync("test/fixtures/profiles/empty-profile.wwe");
		context.subject.flush();

		// sdk export
		assert.instance(await context.subject.import(PROFILE_BLANK), Profile);

		// ww export
		assert.instance(await context.subject.import(wweFileContents.toString()), Profile);
	});

	it("should import ok with password", async (context) => {
		const wweFileContents = readFileSync("test/fixtures/profiles/password-protected-profile.wwe");
		context.subject.flush();

		// sdk export
		assert.instance(await context.subject.import(PROFILE_PASSWORD, "some pass"), Profile);

		// ww export
		assert.instance(await context.subject.import(wweFileContents.toString(), "S3cUrePa$sword"), Profile);
	});

	it("should restore", async (context) => {
		context.subject.flush();

		const profile = await context.subject.create("John");
		await assert.resolves(() => context.subject.restore(profile));
	});

	it("should dump", async (context) => {
		const profile = await context.subject.create("John");

		assert.object(context.subject.dump(profile));
	});

	it("should restore and mark as restored", async (context) => {
		context.subject.flush();

		const profile = await context.subject.create("John");

		await context.subject.restore(profile);

		assert.true(profile.status().isRestored());
	});

	it("should persist profile and reset dirty status", async (context) => {
		context.subject.flush();

		const profile = await context.subject.create("John");
		profile.status().markAsRestored();
		profile.status().markAsDirty();

		assert.true(profile.status().isDirty());

		await context.subject.persist(profile);

		assert.false(profile.status().isDirty());
	});

	it("should not save profile data if profile is not restored", async (context) => {
		context.subject.flush();

		const profile = await context.subject.create("John");
		profile.status().reset();

		const profileAttributeSetMock = stub(profile.getAttributes(), "set").callsFake(() => true);

		assert.false(profile.status().isRestored());
		profileAttributeSetMock.neverCalled();

		await context.subject.persist(profile);

		assert.false(profile.status().isRestored());
		profileAttributeSetMock.neverCalled();
	});

	it("should not save profile data if profile is not marked as dirty", async (context) => {
		context.subject.flush();

		const profile = await context.subject.create("John");

		const profileAttributeSetMock = stub(profile.getAttributes(), "set").callsFake(() => true);

		profile.status().reset();
		assert.false(profile.status().isRestored());
		assert.false(profile.status().isDirty());
		profileAttributeSetMock.neverCalled();

		await context.subject.restore(profile);
		stub(profile.status(), "isDirty").returnValue(false);
		await context.subject.persist(profile);

		assert.true(profile.status().isRestored());
		assert.false(profile.status().isDirty());
		profileAttributeSetMock.neverCalled();
	});
});
