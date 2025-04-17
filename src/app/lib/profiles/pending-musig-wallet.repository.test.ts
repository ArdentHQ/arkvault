import { describe } from "@ardenthq/sdk-test";

import { bootContainer } from "../test/mocking";
import { ProfileSetting } from "./contracts";
import { PendingMusigWalletRepository } from "./pending-musig-wallet.repository";
import { Profile } from "./profile";
import { WalletFactory } from "./wallet.factory.js";

const createEnvironment = async (context: any, { loader, nock }) => {
	nock.fake("https://ark-test.arkvault.io:443", { encodedQueryParams: true })
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
		.get("/api/wallets/1")
		.reply(404)
		.get(/\/api\/wallets\/D.*/)
		.reply(404, `{"statusCode":404,"error":"Not Found","message":"Wallet not found"}`)
		.persist();

	context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });

	context.profile.settings().set(ProfileSetting.Name, "John Doe");

	context.subject = new PendingMusigWalletRepository(context.profile);

	context.factory = new WalletFactory(context.profile);
};

const defaults = {
	data: {
		ADDRESS: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		BALANCE: [Object],
		BROADCASTED_TRANSACTIONS: {},
		COIN: "ARK",
		DERIVATION_PATH: undefined,
		DERIVATION_TYPE: undefined,
		ENCRYPTED_CONFIRM_KEY: undefined,
		ENCRYPTED_SIGNING_KEY: undefined,
		IMPORT_METHOD: "ADDRESS",
		LEDGER_MODEL: undefined,
		NETWORK: "ark.devnet",
		PENDING_MULTISIGNATURE_TRANSACTIONS: {},
		PUBLIC_KEY: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
		SEQUENCE: "111932",
		SIGNED_TRANSACTIONS: {},
		STARRED: false,
		STATUS: "COLD",
		VOTES: [],
		VOTES_AVAILABLE: 0,
		VOTES_USED: 0,
	},
	id: "05146383-b26d-4ac0-aad2-3d5cb7e6c5e2",
	settings: {
		AVATAR: '<svg version="1.1" xmlns="http://www.w3.org/2000/svg" class="picasso" width="100" height="100" viewBox="0 0 100 100"><style>.picasso circle{mix-blend-mode:soft-light;}</style><rect fill="rgb(244, 67, 54)" width="100" height="100"/><circle r="45" cx="80" cy="40" fill="rgb(139, 195, 74)"/><circle r="40" cx="10" cy="30" fill="rgb(0, 188, 212)"/><circle r="60" cx="30" cy="50" fill="rgb(255, 193, 7)"/></svg>',
	},
};

const getAddresses = (context: any): string[] =>
	Object.values(context.subject.toObject()).map((walletData: Record<string, any>) => walletData.data.ADDRESS);

describe("PendingMusigWalletRepository", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll(() => {
		bootContainer();
	});

	beforeEach(async (context) => {
		await createEnvironment(context, { loader, nock });
	});

	it("#add", async (context) => {
		await context.subject.add("D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW", "ARK", "ark.devnet");
		await context.subject.add("D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW", "ARK", "ark.devnet");

		assert.equal(getAddresses(context), ["D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW"]);
	});

	it("#fill", async (context) => {
		await context.subject.fill({
			"05146383-b26d-4ac0-aad2-3d5cb7e6c5e2": defaults,
		});

		assert.equal(getAddresses(context), ["D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW"]);
	});

	it("#toObject", async (context) => {
		await context.subject.add("D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW", "ARK", "ark.devnet");
		const json: Record<string, any> = context.subject.toObject();
		assert.equal(Object.values(json)[0].data.ADDRESS, "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
	});

	it("#sync", async (context) => {
		const json: Record<string, any> = context.subject.toObject();
		await context.subject.sync();
		assert.equal(json, {});
	});

	it("should move to profile wallets if pending wallet is synced with network", async (context) => {
		await context.subject.fill({
			"05146383-b26d-4ac0-aad2-3d5cb7e6c5e2": defaults,
		});

		await context.subject.sync();

		assert.equal(getAddresses(context).length, 0);
		assert.equal(context.profile.wallets().count(), 1);
	});

	it("should move to profile wallets and find available alias", async (context) => {
		const mockExisintWalletAlias = stub(context.profile.wallets(), "findByAlias").returnValueOnce({});
		await context.subject.fill({
			"05146383-b26d-4ac0-aad2-3d5cb7e6c5e2": defaults,
		});

		await context.subject.sync();

		assert.equal(getAddresses(context).length, 0);
		assert.equal(context.profile.wallets().count(), 1);

		mockExisintWalletAlias.restore();
	});

	it("should forget synced pending wallet if already exists in profile wallets", async (context) => {
		const mockExistingWallet = stub(context.profile.wallets(), "findByAddressWithNetwork").returnValue({});

		await context.subject.fill({
			"05146383-b26d-4ac0-aad2-3d5cb7e6c5e2": defaults,
		});

		assert.equal(getAddresses(context).length, 1);

		await context.subject.sync();

		assert.equal(getAddresses(context).length, 0);

		mockExistingWallet.restore();
	});

	it("should forget wallet if removed from musig server and is not broadcasted", async (context) => {
		await context.subject.add("1", "ARK", "ark.devnet");

		assert.equal(getAddresses(context).length, 1);

		await context.subject.sync();

		assert.equal(getAddresses(context).length, 0);
	});

	it("should not remove wallet if it exists in musig server", async (context) => {
		context.profile.wallets().push(
			await context.profile.walletFactory().fromAddress({
				address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		const firstWallet = context.profile.wallets().first();

		const mockPendingTransaction = stub(firstWallet.transaction(), "pending").returnValue({
			id: {
				get: () => ({
					min: 2,
					publicKeys: [firstWallet.publicKey()],
				}),
				isMultiSignatureRegistration: () => true,
			},
		});

		const mockMultisignatureGeneration = stub(firstWallet.coin().address(), "fromMultiSignature").returnValue({
			address: "1",
		});

		await context.subject.add("1", "ARK", "ark.devnet");

		assert.equal(getAddresses(context).length, 1);

		await context.subject.sync();

		assert.equal(getAddresses(context).length, 1);
		mockPendingTransaction.restore();
		mockMultisignatureGeneration.restore();
	});

	it("should forget wallet if pending transaction not found in musig server", async (context) => {
		context.profile.wallets().push(
			await context.profile.walletFactory().fromAddress({
				address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
				coin: "ARK",
				network: "ark.devnet",
			}),
		);

		const firstWallet = context.profile.wallets().first();

		const mockPendingTransaction = stub(firstWallet.transaction(), "pending").returnValue({
			id: {
				isMultiSignatureRegistration: () => false,
			},
		});

		await context.subject.add("1", "ARK", "ark.devnet");

		assert.equal(getAddresses(context).length, 1);

		await context.subject.sync();

		assert.equal(getAddresses(context).length, 0);
		mockPendingTransaction.restore();
	});
});
