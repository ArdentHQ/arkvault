import { UUID } from "@ardenthq/sdk-cryptography";
import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { Wallet } from "./wallet";
import { WalletData, WalletImportMethod } from "./wallet.enum";

describe("WalletMutator", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll(() => bootContainer());

	beforeEach(async (context) => {
		nock.fake()
			.get("/api/node/configuration")
			.reply(200, loader.json("test/fixtures/client/configuration.json"))
			.get("/api/peers")
			.reply(200, loader.json("test/fixtures/client/peers.json"))
			.get("/api/node/configuration/crypto")
			.reply(200, loader.json("test/fixtures/client/cryptoConfiguration.json"))
			.get("/api/node/syncing")
			.reply(200, loader.json("test/fixtures/client/syncing.json"))

			// default wallet
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))
			.get("/api/wallets/030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd")
			.reply(200, loader.json("test/fixtures/client/wallet.json"))

			// second wallet
			.get("/api/wallets/022e04844a0f02b1df78dff2c7c4e3200137dfc1183dcee8fc2a411b00fd1877ce")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))
			.get("/api/wallets/DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))

			// Musig wallet
			.get("/api/wallets/DML7XEfePpj5qDFb1SbCWxLRhzdTDop7V1")
			.reply(200, loader.json("test/fixtures/client/wallet-musig.json"))
			.get("/api/wallets/02cec9caeb855e54b71e4d60c00889e78107f6136d1f664e5646ebcb2f62dae2c6")
			.reply(200, loader.json("test/fixtures/client/wallet-musig.json"))

			.get("/api/delegates")
			.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
			.get("/api/delegates?page=2")
			.reply(200, loader.json("test/fixtures/client/delegates-2.json"))
			.get("/api/transactions/3e0b2e5ed00b34975abd6dee0ca5bd5560b5bd619b26cf6d8f70030408ec5be3")
			.query(true)
			.reply(200, () => {
				const response = loader.json("test/fixtures/client/transactions.json");
				return { data: response.data[0] };
			})
			.get("/api/transactions/bb9004fa874b534905f9eff201150f7f982622015f33e076c52f1e945ef184ed")
			.query(true)
			.reply(200, () => {
				const response = loader.json("test/fixtures/client/transactions.json");
				return { data: response.data[1] };
			})
			.get("/api/transactions")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/transactions.json"))
			// CryptoCompare
			.get("/data/histoday")
			.query(true)
			.reply(200, loader.json("test/fixtures/markets/cryptocompare/historical.json"))
			.persist();

		const profileRepository = container.get(Identifiers.ProfileRepository);
		profileRepository.flush();
		context.profile = await profileRepository.create("John Doe");

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		await context.subject.mutator().coin("ARK", "ark.devnet");
		// await subject.mutator().identity(identity.mnemonic);
	});

	it("should mark the wallet as partially restored if the coin construction fails", async (context) => {
		const subject = new Wallet(UUID.random(), {}, context.profile);

		assert.false(subject.hasBeenPartiallyRestored());

		await subject.mutator().coin("FAKE", "fake.network");

		assert.true(subject.hasBeenPartiallyRestored());
	});

	it("should use the default peer if no custom one is available", async (context) => {
		await context.subject.mutator().coin("ARK", "ark.devnet");

		assert.throws(() => context.subject.coin().config().get("peer"), "unknown");
	});

	// describe("#identity", ({ afterEach, beforeEach, test }) => {
	// 	it.each(["bip39", "bip44", "bip49", "bip84"])("should mutate the address with a path (%s)", async (type) => {
	// 		subject.data().set(WalletData.ImportMethod, WalletImportMethod.Address);

	// 		stub(subject.coin().address(), "fromMnemonic").callsFake(async () => ({
	// 			address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
	// 			path: "path",
	// 			type,
	// 		}));

	// 		assert.false(subject.data().has(WalletData.DerivationType));
	// 		assert.false(subject.data().has(WalletData.DerivationPath));

	// 		await subject.mutator().identity(identity.mnemonic);

	// 		assert.true(subject.data().has(WalletData.DerivationType));
	// 		assert.true(subject.data().has(WalletData.DerivationPath));
	// 	});

	// 	it.each(["bip39", "bip44", "bip49", "bip84"])(
	// 		"should mutate the address with a path for extended public key coin (%s)",
	// 		async (type) => {
	// 			await subject.mutator().coin("BTC", "btc.testnet");

	// 			subject.data().set(WalletData.ImportMethod, WalletImportMethod.PublicKey);
	// 			subject.data().set(WalletData.ImportMethod, WalletImportMethod.PublicKey);

	// 			stub(subject.coin().address(), "fromMnemonic").callsFake(async () => ({
	// 				address: "2NDqSnogr4eQeLrPWM5GmgBvNuMbwdyh1Bi",
	// 				path: "path",
	// 				type,
	// 			}));
	// 			stub(subject.coin().extendedPublicKey(), "fromMnemonic").callsFake(
	// 				async () =>
	// 					"tpubDDtBpveGs7uW1X715ZzEHtH1KinDUTW71E3u1ourxCameEdmWrQMLdFGAAYmgTWbLxWw8Dcb6PAV37eNCZDSUu3s2uc2ZTvXRodnUcTLJ8u",
	// 			);

	// 			assert.false(subject.data().has(WalletData.DerivationType));
	// 			assert.false(subject.data().has(WalletData.DerivationPath));

	// 			await subject.mutator().identity(identity.mnemonic);

	// 			assert.true(subject.data().has(WalletData.DerivationType));
	// 			assert.true(subject.data().has(WalletData.DerivationPath));
	// 		},
	// 	);
	// });

	it("should mutate the address with a path", async (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.Address);

		assert.false(context.subject.data().has(WalletData.DerivationType));
		assert.false(context.subject.data().has(WalletData.DerivationPath));

		await context.subject.mutator().address({
			address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			path: "path",
			type: "bip39",
		});

		assert.true(context.subject.data().has(WalletData.DerivationType));
		assert.true(context.subject.data().has(WalletData.DerivationPath));
	});

	it("#removeEncryption - should remove the encryption password of a wallet imported by mnemonic", async (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);

		await context.subject.signingKey().set(identity.mnemonic, "password");

		const { address } = await context.subject.coin().address().fromMnemonic(identity.mnemonic);

		stub(context.subject, "address").returnValueOnce(address);
		stub(context.subject, "isSecondSignature").returnValueOnce(false);

		assert.true(context.subject.signingKey().exists());

		await context.subject.mutator().removeEncryption("password");

		assert.false(context.subject.signingKey().exists());

		assert.is(context.subject.data().get(WalletData.ImportMethod), WalletImportMethod.BIP39.MNEMONIC);
	});

	it("#removeEncryption - should remove the encryption password of a wallet imported by mnemonic with second signature", async (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);

		await context.subject.signingKey().set(identity.mnemonic, "password");
		await context.subject.confirmKey().set(identity.secondMnemonic, "password");

		const { address } = await context.subject.coin().address().fromMnemonic(identity.mnemonic);

		stub(context.subject, "address").returnValueOnce(address);
		stub(context.subject, "isSecondSignature").returnValueOnce(true);

		assert.true(context.subject.signingKey().exists());
		assert.true(context.subject.confirmKey().exists());

		await context.subject.mutator().removeEncryption("password");

		assert.false(context.subject.signingKey().exists());
		assert.false(context.subject.confirmKey().exists());

		assert.is(context.subject.data().get(WalletData.ImportMethod), WalletImportMethod.BIP39.MNEMONIC);
	});

	it("#removeEncryption - should remove the encryption password of a wallet imported by secret", async (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.SECRET_WITH_ENCRYPTION);

		await context.subject.signingKey().set("secret", "password");

		const { address } = await context.subject.coin().address().fromSecret("secret");

		stub(context.subject, "address").returnValueOnce(address);
		stub(context.subject, "isSecondSignature").returnValueOnce(false);

		assert.true(context.subject.signingKey().exists());

		await context.subject.mutator().removeEncryption("password");

		assert.false(context.subject.signingKey().exists());

		assert.is(context.subject.data().get(WalletData.ImportMethod), WalletImportMethod.SECRET);
	});

	it("#removeEncryption - should remove the encryption password of a wallet imported by secret with second signature", async (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.SECRET_WITH_ENCRYPTION);

		await context.subject.signingKey().set("secret", "password");
		await context.subject.confirmKey().set("second-secret", "password");

		const { address } = await context.subject.coin().address().fromSecret("secret");

		stub(context.subject, "address").returnValueOnce(address);
		stub(context.subject, "isSecondSignature").returnValueOnce(true);

		assert.true(context.subject.signingKey().exists());
		assert.true(context.subject.confirmKey().exists());

		await context.subject.mutator().removeEncryption("password");

		assert.false(context.subject.signingKey().exists());
		assert.false(context.subject.confirmKey().exists());

		assert.is(context.subject.data().get(WalletData.ImportMethod), WalletImportMethod.SECRET);
	});

	it("#removeEncryption - should throw if the wallet has an unsupported import method", async (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.Address);

		await assert.rejects(
			() => context.subject.mutator().removeEncryption("wrong-password"),
			`Import method [${WalletImportMethod.Address}] is not supported.`,
		);
	});

	it("#removeEncryption - should throw if the provided password does not match the wallet", async (context) => {
		await context.subject.signingKey().set(identity.mnemonic, "password");

		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.BIP39.MNEMONIC_WITH_ENCRYPTION);

		await assert.rejects(
			() => context.subject.mutator().removeEncryption("wrong-password"),
			"The provided password does not match the wallet.",
		);
	});
});
