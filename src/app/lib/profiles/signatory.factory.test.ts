import { Signatories } from "@ardenthq/sdk";
import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { Profile } from "./profile";
import { SignatoryFactory } from "./signatory.factory.js";

const mnemonic = identity.mnemonic;

describe("SignatoryFactory", ({ beforeEach, assert, nock, loader, stub, it }) => {
	beforeEach(async (context) => {
		bootContainer();

		nock.fake()
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"));

		context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });

		context.wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic,
			network: "ark.devnet",
		});

		context.wallet.data().set("PUBLIC_KEY", "0291bd988a9375618f2b4cc2a45ed4189066870342708efebbeb6e46951e15263a");

		context.subject = new SignatoryFactory(context.wallet);
	});

	it("returns signatory when mnemonic is provided", async (context) => {
		assert.instance(await context.subject.make({ mnemonic }), Signatories.Signatory);
	});

	it("returns signatory when mnemonic and 2nd mnemonic are provided", async (context) => {
		assert.instance(
			await context.subject.make({ mnemonic, secondMnemonic: "second mnemonic" }),
			Signatories.Signatory,
		);
	});

	it("when encryption password is provided it returns signatory when wallet acts with mnemonic", async (context) => {
		stub(context.wallet, "isSecondSignature").returnValueOnce(false);
		await context.wallet.signingKey().set(mnemonic, "password");

		assert.instance(await context.subject.make({ encryptionPassword: "password" }), Signatories.Signatory);
	});

	it("when encryption password is provided it returns signatory when wallet and acts with mnemonic and has 2nd signature", async (context) => {
		stub(context.wallet, "isSecondSignature").returnValueOnce(true);
		await context.wallet.signingKey().set(mnemonic, "password");
		await context.wallet.confirmKey().set("second mnemonic", "password");

		assert.instance(await context.subject.make({ encryptionPassword: "password" }), Signatories.Signatory);
	});

	it("when encryption password is provided it returns signatory when wallet acts with secret", async (context) => {
		context.wallet = await context.profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			password: "password",
			secret: "secret",
		});

		stub(context.wallet, "isSecondSignature").returnValueOnce(false);

		context.subject = new SignatoryFactory(context.wallet);

		assert.instance(await context.subject.make({ encryptionPassword: "password" }), Signatories.Signatory);
	});

	it("when encryption password is provided it returns signatory when wallet acts with secret and has 2nd signature", async (context) => {
		context.wallet = await context.profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			password: "password",
			secret: "secret",
		});

		stub(context.wallet, "isSecondSignature").returnValueOnce(true);

		await context.wallet.confirmKey().set("second secret", "password");

		context.subject = new SignatoryFactory(context.wallet);

		assert.instance(await context.subject.make({ encryptionPassword: "password" }), Signatories.Signatory);
	});

	it("returns signatory when wallet is multi-signature", async (context) => {
		stub(context.wallet, "isMultiSignature").returnValueOnce(true);
		stub(context.wallet.multiSignature(), "all").returnValueOnce({
			min: 1,
			publicKeys: [context.wallet.publicKey()],
		});

		assert.instance(await context.subject.make({}), Signatories.Signatory);
	});

	it("returns signatory when wallet is Ledger", async (context) => {
		stub(context.wallet, "isMultiSignature").returnValueOnce(false);
		stub(context.wallet, "isLedger").returnValueOnce(true);
		stub(context.wallet.data(), "get").returnValueOnce("m/44'/111'/0'/0/0");

		assert.instance(await context.subject.make({}), Signatories.Signatory);
	});

	it("throw error when wallet is Ledger but no derivation path exists", async (context) => {
		stub(context.wallet, "isMultiSignature").returnValueOnce(false);
		stub(context.wallet, "isLedger").returnValueOnce(true);

		await assert.rejects(() => context.subject.make({}), "[derivationPath] must be string.");
	});

	it("returns signatory when wif is provided", async (context) => {
		stub(context.wallet, "isMultiSignature").returnValueOnce(false);

		const { wif } = await context.wallet.wifService().fromMnemonic(mnemonic);

		assert.instance(await context.subject.make({ wif }), Signatories.Signatory);
	});

	it("returns signatory when private key is provided", async (context) => {
		stub(context.wallet, "isMultiSignature").returnValueOnce(false);

		const { privateKey } = await context.wallet.privateKeyService().fromMnemonic(mnemonic);

		assert.instance(await context.subject.make({ privateKey }), Signatories.Signatory);
	});

	it("returns signatory when secret is provided", async (context) => {
		context.wallet = await context.profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret: "secret",
		});

		stub(context.wallet, "isMultiSignature").returnValueOnce(false);

		context.subject = new SignatoryFactory(context.wallet);

		assert.instance(await context.subject.make({ secret: "secret" }), Signatories.Signatory);
	});

	it("returns signatory when secret and 2nd secret are provided", async (context) => {
		context.wallet = await context.profile.walletFactory().fromSecret({
			coin: "ARK",
			network: "ark.devnet",
			secret: "secret",
		});

		stub(context.wallet, "isMultiSignature").returnValueOnce(false);
		stub(context.wallet, "isSecondSignature").returnValueOnce(true);

		context.subject = new SignatoryFactory(context.wallet);

		assert.instance(
			await context.subject.make({ secondSecret: "second secret", secret: "secret" }),
			Signatories.Signatory,
		);
	});

	it("throws error when no signing key is provided", async (context) => {
		stub(context.wallet, "isMultiSignature").returnValueOnce(false);

		await assert.rejects(() => context.subject.make({}), "No signing key provided.");
	});
});
