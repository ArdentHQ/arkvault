import { BIP38 } from "@ardenthq/sdk-cryptography";
import { Identifiers } from "./container.models";
import { WalletIdentifierFactory } from "./wallet.identifier.factory.js";
import { bootContainer } from "../test/mocking";
import { container } from "./container";
import { describe } from "@ardenthq/sdk-test";
import { identity } from "../test/fixtures/identity";

describe("WalletIdentifierFactory", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll(() => {
		bootContainer();
	});

	beforeEach(async (context) => {
		nock.fake()
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get("/api/wallets/D7seWn8JLVwX4nHd9hh2Lf7gvZNiRJ7qLk")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get("/api/wallets/DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"));

		const profileRepository = container.get(Identifiers.ProfileRepository);
		profileRepository.flush();
		context.profile = await profileRepository.create("John Doe");
	});

	it("should not create wallet identifier when unknown method", async (context) => {
		const wallet = await context.profile.walletFactory().fromAddress({
			address: "DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w",
			coin: "ARK",
			network: "ark.devnet",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: undefined,
			type: "address",
			value: "DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w",
		});
	});

	it("should create wallet identifier for address", async (context) => {
		const wallet = await context.profile.walletFactory().fromAddress({
			address: "DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w",
			coin: "ARK",
			network: "ark.devnet",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: undefined,
			type: "address",
			value: "DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w",
		});
	});

	it("should create wallet identifier with mnenonic", async (context) => {
		const wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		});
	});

	// it("should create wallet identifier with mnenonic for network that uses extended public key", async (context) => {
	// 	const wallet = await context.profile.walletFactory().fromMnemonicWithBIP44({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: identity.mnemonic,
	// 		network: "btc.livenet",
	// 	});

	// 	assert.equal(await WalletIdentifierFactory.make(wallet), {
	// 		method: "bip44",
	// 		type: "extendedPublicKey",
	// 		value: "xpub6CVZnKBTDKtVdkizs2fwFrb5WDjsc4MzCqmFSHEU1jYvuugQaQBzVzF5A7E9AVr793Lj5KPtFdyNcmA42RtFeko8JDZ2nUpciHRQFMGdcvM",
	// 	});
	// });

	it("should create wallet identifier with mnenonic with password", async (context) => {
		const wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
			password: "password",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		});
	});

	// it("should create wallet identifier with mnenonic with password for network that uses extended public key", async (context) => {
	// 	const wallet = await context.profile.walletFactory().fromMnemonicWithBIP44({
	// 		coin: "BTC",
	// 		levels: { account: 0 },
	// 		mnemonic: identity.mnemonic,
	// 		network: "btc.livenet",
	// 		password: "password",
	// 	});

	// 	assert.equal(await WalletIdentifierFactory.make(wallet), {
	// 		method: "bip44",
	// 		type: "extendedPublicKey",
	// 		value: "xpub6CVZnKBTDKtVdkizs2fwFrb5WDjsc4MzCqmFSHEU1jYvuugQaQBzVzF5A7E9AVr793Lj5KPtFdyNcmA42RtFeko8JDZ2nUpciHRQFMGdcvM",
	// 	});
	// });

	it("should create wallet identifier with public key", async (context) => {
		const wallet = await context.profile.walletFactory().fromPublicKey({
			coin: "ARK",
			network: "ark.devnet",
			publicKey: identity.publicKey,
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		});
	});

	it("should create wallet identifier with private key", async (context) => {
		const wallet = await context.profile.walletFactory().fromPrivateKey({
			coin: "ARK",
			network: "ark.devnet",
			privateKey: identity.privateKey,
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		});
	});

	it("should create wallet identifier with secret", async (context) => {
		const wallet = await context.profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret: "secret",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D7seWn8JLVwX4nHd9hh2Lf7gvZNiRJ7qLk",
		});
	});

	it("should create wallet identifier with secret with encryption", async (context) => {
		const wallet = await context.profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			password: "password",
			secret: "secret",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D7seWn8JLVwX4nHd9hh2Lf7gvZNiRJ7qLk",
		});
	});

	it("should create wallet identifier with wif", async (context) => {
		const wallet = await context.profile.walletFactory().fromWIF({
			coin: "ARK",
			network: "ark.devnet",
			wif: "SHA89yQdW3bLFYyCvEBpn7ngYNR8TEojGCC1uAJjT5esJPm1NiG3",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		});
	});

	it("should create wallet identifier with wif with encryption", async (context) => {
		const stubEncrypt = stub(BIP38, "encrypt").returnValue(
			"6PYRydorcUPgUAtyd8KQCPd3YHo3vBAmSkBmwFcbEj7W4wBWoQ4JjxLj2d",
		);
		const stubDecrypt = stub(BIP38, "decrypt").returnValue({
			compressed: true,
			privateKey: Buffer.from("e2511a6022953eb399fbd48f84619c04c894f735aee107b02a7690075ae67617", "hex"),
		});

		const wallet = await context.profile.walletFactory().fromWIF({
			coin: "ARK",
			network: "ark.devnet",
			password: "password",
			wif: "6PYRydorcUPgUAtyd8KQCPd3YHo3vBAmSkBmwFcbEj7W4wBWoQ4JjxLj2d",
		});

		assert.equal(await WalletIdentifierFactory.make(wallet), {
			method: "bip39",
			type: "address",
			value: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
		});
	});
});
