import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { Wallet } from "./wallet";
import { WalletFactory } from "./wallet.factory.js";
import { WalletRepository } from "./wallet.repository";

const generate = async (context, coin, network) => {
	const { wallet } = await context.factory.generate({ coin, network });

	context.subject.push(wallet);

	return wallet;
};

const importByMnemonic = async (context, mnemonic, coin, network, bip) => {
	const wallet = await context.factory[
		{
			39: "fromMnemonicWithBIP39",
			44: "fromMnemonicWithBIP44",
			49: "fromMnemonicWithBIP49",
			84: "fromMnemonicWithBIP84",
		}[bip]
	]({
		coin,
		levels: {
			39: {},
			44: { account: 0 },
			49: { account: 0 },
			84: { account: 0 },
		}[bip],
		mnemonic,
		network,
	});

	await wallet.synchroniser().identity();

	context.subject.push(wallet);

	return wallet;
};

const createEnvironment = async (context, { loader, nock }) => {
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
		.get(/\/api\/wallets\/D.*/)
		.reply(404, `{"statusCode":404,"error":"Not Found","message":"Wallet not found"}`)
		.persist();

	nock.fake("https://platform.ark.io:443", { encodedQueryParams: true })
		.get("/api/eth/wallets/0xF3D149CFDAAC1ECA70CFDCE04702F34CCEAD43E2")
		.reply(200, loader.json("test/fixtures/client/configuration.json"))
		.persist();

	const profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });

	profile.settings().set(ProfileSetting.Name, "John Doe");

	context.subject = new WalletRepository(profile);
	context.factory = new WalletFactory(profile);

	const wallet = await importByMnemonic(context, identity.mnemonic, "ARK", "ark.devnet", 39);
	context.subject.update(wallet.id(), { alias: "Alias" });
};

describe("WalletRepository", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll(() => {
		bootContainer();
	});

	beforeEach(async (context) => {
		await createEnvironment(context, { loader, nock });
	});

	it("#all", (context) => {
		assert.object(context.subject.all());
	});

	it("#first", (context) => {
		assert.object(context.subject.first());
	});

	it("#last", (context) => {
		assert.object(context.subject.last());
	});

	it("#allByCoin", async (context) => {
		await importByMnemonic(
			context,
			"upset boat motor few ketchup merge punch gesture lecture piano neutral uniform",
			"ARK",
			"ark.devnet",
			39,
		);

		assert.object(context.subject.allByCoin());
		assert.object(context.subject.allByCoin().DARK);
	});

	it("#filterByAddress", (context) => {
		const wallets = context.subject.filterByAddress(identity.address);

		assert.array(wallets);

		for (const wallet of wallets) {
			assert.instance(wallet, Wallet);
		}
	});

	it("#findByAddressWithNetwork", (context) => {
		assert.instance(context.subject.findByAddressWithNetwork(identity.address, "ark.devnet"), Wallet);
	});

	it("#findByPublicKey", (context) => {
		assert.instance(context.subject.findByPublicKey(identity.publicKey), Wallet);
	});

	it("#findByCoin", (context) => {
		assert.length(context.subject.findByCoin("ARK"), 1);
	});

	it("#findByCoinWithNetwork", (context) => {
		assert.length(context.subject.findByCoinWithNetwork("ARK", "ark.devnet"), 1);
	});

	it("#findByCoinWithNethash", (context) => {
		assert.length(
			context.subject.findByCoinWithNethash(
				"ARK",
				"2a44f340d76ffc3df204c5f38cd355b7496c9065a1ade2ef92071436bd72e867",
			),
			1,
		);
	});

	it("#has", async (context) => {
		const wallet = context.subject.first();

		assert.true(context.subject.has(wallet.id()));
		assert.false(context.subject.has("whatever"));
	});

	it("#forget", async (context) => {
		const wallet = context.subject.first();

		assert.true(context.subject.has(wallet.id()));

		context.subject.forget(wallet.id());

		assert.false(context.subject.has(wallet.id()));
	});

	it("#findByAlias", async (context) => {
		await generate(context, "ARK", "ark.devnet");

		assert.instance(context.subject.findByAlias("Alias"), Wallet);
		assert.undefined(context.subject.findByAlias("Not Exist"));
	});

	it("#push", async (context) => {
		context.subject.flush();

		await assert.resolves(() => importByMnemonic(context, identity.mnemonic, "ARK", "ark.devnet", 39));
		await assert.rejects(() => importByMnemonic(context, identity.mnemonic, "ARK", "ark.devnet", 39));

		const wallet = context.subject.first();

		stub(wallet, "networkId").returnValueOnce("ark.mainnet");

		await assert.resolves(() => importByMnemonic(context, identity.mnemonic, "ARK", "ark.devnet", 39));
	});

	it("#update", async (context) => {
		assert.throws(() => context.subject.update("invalid", { alias: "My Wallet" }), "Failed to find");

		const wallet = await generate(context, "ARK", "ark.devnet");

		context.subject.update(wallet.id(), { alias: "My New Wallet" });

		assert.is(context.subject.findById(wallet.id()).alias(), "My New Wallet");

		context.subject.update(wallet.id(), {});

		assert.is(context.subject.findById(wallet.id()).alias(), "My New Wallet");

		const newWallet = await generate(context, "ARK", "ark.devnet");

		assert.throws(
			() => context.subject.update(newWallet.id(), { alias: "My New Wallet" }),
			"The wallet with alias [My New Wallet] already exists.",
		);
	});

	// describe("#fill", ({ afterEach, beforeEach, test }) => {
	// 	beforeEach(async () => {
	// 		await createEnv();
	// 	});

	// 	it("should fill the wallet", async () => {
	// 		const profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
	// 		profile.settings().set(ProfileSetting.Name, "John Doe");

	// 		const newWallet = await profile.walletFactory().fromMnemonicWithBIP39({
	// 			coin: "ARK",
	// 			mnemonic: "obvious office stock bind patient jazz off neutral figure truth start limb",
	// 			network: "ark.devnet",
	// 		});

	// 		assert.is(
	// 			await subject.fill({
	// 				[newWallet.id()]: {
	// 					data: newWallet.data().all(),
	// 					id: newWallet.id(),
	// 					settings: newWallet.settings().all(),
	// 				},
	// 			}),
	// 		);

	// 		assert.equal(subject.findById(newWallet.id()), newWallet);
	// 	});

	// 	it("should fail to fill the wallet if the coin doesn't exist", async () => {
	// 		const profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
	// 		profile.settings().set(ProfileSetting.Name, "John Doe");

	// 		const newWallet = await profile.walletFactory().fromMnemonicWithBIP39({
	// 			coin: "ARK",
	// 			mnemonic: "obvious office stock bind patient jazz off neutral figure truth start limb",
	// 			network: "ark.devnet",
	// 		});

	// 		newWallet.data().set(WalletData.Coin, "invalid");

	// 		assert.is(
	// 			await subject.fill({
	// 				[newWallet.id()]: {
	// 					data: newWallet.data().all(),
	// 					id: newWallet.id(),
	// 					settings: newWallet.settings().all(),
	// 				},
	// 			}),
	// 		);

	// 		assert.true(subject.findById(newWallet.id()).isMissingCoin());
	// 		assert.true(subject.findById(newWallet.id()).isMissingNetwork());
	// 	});

	// 	it("should fail to fill the wallet if the network doesn't exist", async () => {
	// 		const profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
	// 		profile.settings().set(ProfileSetting.Name, "John Doe");

	// 		const newWallet = await profile.walletFactory().fromMnemonicWithBIP39({
	// 			coin: "ARK",
	// 			mnemonic: "obvious office stock bind patient jazz off neutral figure truth start limb",
	// 			network: "ark.devnet",
	// 		});

	// 		newWallet.data().set(WalletData.Network, "invalid");

	// 		assert.is(
	// 			await subject.fill({
	// 				[newWallet.id()]: {
	// 					data: newWallet.data().all(),
	// 					id: newWallet.id(),
	// 					settings: newWallet.settings().all(),
	// 				},
	// 			}),
	// 		);

	// 		assert.false(subject.findById(newWallet.id()).isMissingCoin());
	// 		assert.true(subject.findById(newWallet.id()).isMissingNetwork());
	// 	});
	// });

	// describe("#sortBy", ({ afterEach, beforeEach, test }) => {
	// 	let walletARK;
	// 	let walletBTC;
	// 	let walletLSK;

	// 	beforeEach(async () => {
	// 		await createEnv();

	// 		subject.flush();

	// 		walletARK = await importByMnemonic(
	// 			"wood summer suggest unlock device trust else basket minimum hire lady cute",
	// 			"ARK",
	// 			"ark.devnet",
	// 			39,
	// 		);
	// 		walletBTC = await importByMnemonic(
	// 			"brisk grab cash invite labor frozen scrap endorse fault fence prison brisk",
	// 			"BTC",
	// 			"btc.testnet",
	// 			44,
	// 		);
	// 		walletLSK = await importByMnemonic(
	// 			"print alert reflect tree draw assault mean lift burst pattern rain subway",
	// 			"LSK",
	// 			"lsk.mainnet",
	// 			39,
	// 		);
	// 	});

	// 	it("should sort by coin", async () => {
	// 		const wallets = subject.sortBy("coin");

	// 		assert.is(wallets[0].address(), walletBTC.address()); // BTC
	// 		assert.is(wallets[1].address(), walletARK.address()); // DARK
	// 		assert.is(wallets[2].address(), walletLSK.address()); // LSK
	// 	});

	// 	it("should sort by coin desc", async () => {
	// 		const wallets = subject.sortBy("coin", "desc");

	// 		assert.is(wallets[0].address(), walletLSK.address()); // LSK
	// 		assert.is(wallets[1].address(), walletARK.address()); // DARK
	// 		assert.is(wallets[2].address(), walletBTC.address()); // BTC
	// 	});

	// 	it("should sort by address", async () => {
	// 		const wallets = subject.sortBy("address");

	// 		assert.is(wallets[0].address(), walletARK.address());
	// 		assert.is(wallets[1].address(), walletLSK.address());
	// 		assert.is(wallets[2].address(), walletBTC.address());
	// 	});

	// 	it("should sort by type", async () => {
	// 		walletARK.toggleStarred();
	// 		walletLSK.toggleStarred();

	// 		const wallets = subject.sortBy("type");

	// 		assert.is(wallets[0].address(), walletBTC.address());
	// 		assert.is(wallets[1].address(), walletARK.address());
	// 		assert.is(wallets[2].address(), walletLSK.address());
	// 	});

	// 	it("should sort by balance", async () => {
	// 		const wallets = subject.sortBy("balance");

	// 		assert.is(wallets[0].address(), walletARK.address());
	// 		assert.is(wallets[1].address(), walletBTC.address());
	// 		assert.is(wallets[2].address(), walletLSK.address());
	// 	});

	// 	it("should export toObject", async () => {
	// 		const wallets = subject.toObject();

	// 		assert.instance(wallets, Object);
	// 	});
	// });

	// describe("restore", function ({ afterEach, beforeEach, test }) {
	// 	let profile;
	// 	let wallet;

	// 	beforeEach(async () => {
	// 		await createEnv();

	// 		profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
	// 		profile.settings().set(ProfileSetting.Name, "John Doe");

	// 		wallet = await profile.walletFactory().fromMnemonicWithBIP39({
	// 			coin: "ARK",
	// 			mnemonic: "obvious office stock bind patient jazz off neutral figure truth start limb",
	// 			network: "ark.devnet",
	// 		});

	// 		await subject.fill({
	// 			[wallet.id()]: {
	// 				data: wallet.data().all(),
	// 				id: wallet.id(),
	// 				settings: wallet.settings().all(),
	// 			},
	// 		});
	// 	});

	// 	it("should restore", async () => {
	// 		const newWallet2 = await profile.walletFactory().fromMnemonicWithBIP39({
	// 			coin: "ARK",
	// 			mnemonic: "obvious office stock bind patient jazz off neutral figure truth start limb",
	// 			network: "ark.devnet",
	// 		});

	// 		await subject.fill({
	// 			[wallet.id()]: {
	// 				data: wallet.data().all(),
	// 				id: wallet.id(),
	// 				settings: wallet.settings().all(),
	// 			},
	// 			[newWallet2.id()]: {
	// 				data: newWallet2.data().all(),
	// 				id: newWallet2.id(),
	// 				settings: newWallet2.settings().all(),
	// 			},
	// 		});

	// 		await subject.restore();

	// 		assert.true(subject.findById(wallet.id()).hasBeenFullyRestored());
	// 		assert.true(subject.findById(newWallet2.id()).hasBeenFullyRestored());
	// 	});

	// 	it("should do nothing if the wallet has already been fully restored", async () => {
	// 		subject.findById(wallet.id()).markAsFullyRestored();

	// 		await subject.restore();

	// 		assert.true(subject.findById(wallet.id()).hasBeenFullyRestored());
	// 		assert.false(subject.findById(wallet.id()).hasBeenPartiallyRestored());
	// 	});

	// 	// @TODO: implement callsFakeOnce
	// 	skip("should retry if it encounters a failure during restoration", async () => {
	// 		// Nasty: we need to mock a failure on the wallet instance the repository has
	// 		stub(subject.findById(wallet.id()), "mutator").callsFakeOnce(() => {
	// 			throw new Error();
	// 		});

	// 		await subject.restore();

	// 		assert.true(subject.findById(wallet.id()).hasBeenFullyRestored());
	// 	});
	// });
});
