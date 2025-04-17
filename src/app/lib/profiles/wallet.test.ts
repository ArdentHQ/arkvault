import { Coins } from "@ardenthq/sdk";
import { UUID } from "@ardenthq/sdk-cryptography";
import { BigNumber } from "@ardenthq/sdk-helpers";
import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { WalletData, WalletFlag, WalletImportMethod, WalletLedgerModel, WalletSetting } from "./contracts";
import { ExchangeRateService } from "./exchange-rate.service.js";
import { SignatoryFactory } from "./signatory.factory.js";
import { Wallet } from "./wallet";
import { WalletImportFormat } from "./wif.js";

describe("Wallet", ({ beforeAll, beforeEach, loader, nock, assert, stub, it }) => {
	beforeAll(() => {
		bootContainer();
	});

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

			.get("/api/wallets", {})
			.query({ limit: 1, nonce: 0 })
			.reply(200, {})

			// default wallet
			.get("/api/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW")
			.reply(200, loader.json("test/fixtures/client/wallet-non-resigned.json"))
			.get("/api/wallets/030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd")
			.reply(200, loader.json("test/fixtures/client/wallet-non-resigned.json"))

			// second wallet
			.get("/api/wallets/DNc92FQmYu8G9Xvo6YqhPtRxYsUxdsUn9w")
			.reply(200, loader.json("test/fixtures/client/wallet-2.json"))
			.get("/api/wallets/022e04844a0f02b1df78dff2c7c4e3200137dfc1183dcee8fc2a411b00fd1877ce")
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
			.reply(200, () => loader.json("test/fixtures/client/transactions.json"))
			// CryptoCompare
			.get("/data/histoday")
			.query(true)
			.reply(200, loader.json("test/fixtures/markets/cryptocompare/historical.json"))
			.persist();

		// Make sure we don't persist any data between runs
		if (container.has(Identifiers.ExchangeRateService)) {
			container.unbind(Identifiers.ExchangeRateService);
			container.singleton(Identifiers.ExchangeRateService, ExchangeRateService);
		}

		const profileRepository = container.get(Identifiers.ProfileRepository);
		profileRepository.flush();
		context.profile = await profileRepository.create("John Doe");

		context.subject = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		await context.subject.synchroniser().identity();
	});

	// afterEach(() => jest.restoreAllMocks());

	it("should have a coin", (context) => {
		assert.instance(context.subject.coin(), Coins.Coin);
	});

	it("should have a network", (context) => {
		assert.object(context.subject.network().toObject());
	});

	it("should have an address", (context) => {
		assert.is(context.subject.address(), identity.address);
	});

	it("should have a publicKey", (context) => {
		assert.is(context.subject.publicKey(), identity.publicKey);
	});

	it("should have an import method", (context) => {
		assert.is(context.subject.importMethod(), WalletImportMethod.BIP39.MNEMONIC);
	});

	it("should have a derivation method", (context) => {
		assert.is(context.subject.derivationMethod(), "bip39");
	});

	it("should have a balance", (context) => {
		assert.is(context.subject.balance(), 558_270.934_445_56);

		context.subject.data().set(WalletData.Balance, undefined);

		assert.is(context.subject.balance(), 0);
	});

	it("should have a converted balance if it is a live wallet", async (context) => {
		// cryptocompare
		nock.fake()
			.get("/data/dayAvg")
			.query(true)
			.reply(200, { BTC: 0.000_050_48, ConversionType: { conversionSymbol: "", type: "direct" } })
			.persist();

		const wallet = await importByMnemonic(context.profile, identity.mnemonic, "ARK", "ark.devnet");
		const live = stub(context.subject.network(), "isLive").returnValue(true);
		const test = stub(context.subject.network(), "isTest").returnValue(false);

		wallet.data().set(WalletData.Balance, { available: 1e8, fees: 1e8 });

		assert.number(wallet.convertedBalance());
		assert.is(wallet.convertedBalance(), 0);

		await container.get(Identifiers.ExchangeRateService).syncAll(context.profile, "DARK");
		assert.is(wallet.convertedBalance(), 0.000_050_48);
	});

	it("should not have a converted balance if it is a live wallet but has no exchange rate", async (context) => {
		const live = stub(context.subject.network(), "isLive").returnValue(true);
		const test = stub(context.subject.network(), "isTest").returnValue(false);

		assert.is(context.subject.convertedBalance(), 0);
	});

	it("should not have a converted balance if it is a test wallet", async (context) => {
		const live = stub(context.subject.network(), "isLive").returnValue(false);
		const test = stub(context.subject.network(), "isTest").returnValue(true);

		assert.is(context.subject.convertedBalance(), 0);
	});

	it("should have a nonce", (context) => {
		assert.equal(context.subject.nonce(), BigNumber.make("111932"));

		context.subject.data().set(WalletData.Sequence, undefined);

		assert.is(context.subject.nonce().toNumber(), 0);
	});

	it("should have a manifest service", (context) => {
		assert.instance(context.subject.manifest(), Coins.Manifest);
	});

	it("should have a config service", (context) => {
		assert.instance(context.subject.config(), Coins.ConfigRepository);
	});

	it("should have a client service", (context) => {
		assert.object(context.subject.client());
	});

	it("should have a address service", (context) => {
		assert.object(context.subject.addressService());
	});

	it("should have a extended address service", (context) => {
		assert.object(context.subject.extendedAddressService());
	});

	it("should have a key pair service", (context) => {
		assert.object(context.subject.keyPairService());
	});

	it("should have a private key service", (context) => {
		assert.object(context.subject.privateKeyService());
	});

	it("should have a public key service", (context) => {
		assert.object(context.subject.publicKeyService());
	});

	it("should have a wif service", (context) => {
		assert.object(context.subject.wifService());
	});

	it("should have a ledger service", (context) => {
		assert.object(context.subject.ledger());
	});

	it("should have a ledger model", (context) => {
		assert.is(context.subject.balance(), 558_270.934_445_56);

		context.subject.data().set(WalletData.LedgerModel, WalletLedgerModel.NanoS);
		assert.is(context.subject.data().get(WalletData.LedgerModel), WalletLedgerModel.NanoS);
		assert.true(context.subject.isLedgerNanoS());
		assert.false(context.subject.isLedgerNanoX());

		context.subject.data().set(WalletData.LedgerModel, WalletLedgerModel.NanoX);
		assert.is(context.subject.data().get(WalletData.LedgerModel), WalletLedgerModel.NanoX);
		assert.true(context.subject.isLedgerNanoX());
		assert.false(context.subject.isLedgerNanoS());
	});

	it("should have a link service", (context) => {
		assert.object(context.subject.link());
	});

	it("should have a message service", (context) => {
		assert.object(context.subject.message());
	});

	it("should have a signatory service", (context) => {
		assert.object(context.subject.signatory());
	});

	it("should have a list of supported transaction types", (context) => {
		assert.array(context.subject.transactionTypes());
	});

	it("should have an exchange currency", (context) => {
		assert.is(context.subject.exchangeCurrency(), "BTC");
	});

	it("should have a display name (alias)", (context) => {
		context.subject.mutator().alias("alias");
		assert.is(context.subject.displayName(), context.subject.alias());
	});

	it("should have a display name (username)", (context) => {
		assert.is(context.subject.displayName(), context.subject.username());
	});

	it("should have a display name (knownName)", (context) => {
		const usernameSpy = stub(context.subject, "username").returnValue();

		if (container.has(Identifiers.KnownWalletService)) {
			container.unbind(Identifiers.KnownWalletService);
		}

		container.constant(Identifiers.KnownWalletService, {
			name: (a, b) => "knownWallet",
		});

		assert.is(context.subject.displayName(), context.subject.knownName());

		usernameSpy.restore();
	});

	it("should have an avatar", (context) => {
		assert.string(context.subject.avatar());

		context.subject.data().set(WalletSetting.Avatar, "my-avatar");

		assert.is(context.subject.avatar(), "my-avatar");
	});

	it("should have a known name", (context) => {
		if (container.has(Identifiers.KnownWalletService)) {
			container.unbind(Identifiers.KnownWalletService);
		}

		container.constant(Identifiers.KnownWalletService, {
			name: (a, b) => "arkx",
		});

		assert.is(context.subject.knownName(), "arkx");
	});

	it("should have a second public key", async (context) => {
		assert.undefined(context.subject.secondPublicKey());

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.secondPublicKey(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have a username", async (context) => {
		assert.is(context.subject.username(), "arkx");

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.username(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should respond on whether it is a delegate or not", async (context) => {
		assert.true(context.subject.isDelegate());

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.isDelegate(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should respond on whether it is a resigned delegate or not", async (context) => {
		assert.false(context.subject.isResignedDelegate());

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.isResignedDelegate(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should respond on whether it is known", (context) => {
		if (container.has(Identifiers.KnownWalletService)) {
			container.unbind(Identifiers.KnownWalletService);
		}

		container.constant(Identifiers.KnownWalletService, {
			is: (a, b) => false,
		});

		assert.false(context.subject.isKnown());
	});

	it("should respond on whether it is owned by exchange", (context) => {
		if (container.has(Identifiers.KnownWalletService)) {
			container.unbind(Identifiers.KnownWalletService);
		}

		container.constant(Identifiers.KnownWalletService, {
			isExchange: (a, b) => false,
		});

		assert.false(context.subject.isOwnedByExchange());
	});

	it("should respond on whether it is owned by a team", (context) => {
		if (container.has(Identifiers.KnownWalletService)) {
			container.unbind(Identifiers.KnownWalletService);
		}

		container.constant(Identifiers.KnownWalletService, {
			isTeam: (a, b) => false,
		});

		assert.false(context.subject.isOwnedByTeam());
	});

	it("should respond on whether it is ledger", (context) => {
		assert.false(context.subject.isLedger());
	});

	it("should respond on whether it is multi signature or not", async (context) => {
		assert.false(context.subject.isMultiSignature());

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.isMultiSignature(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should respond on whether it is second signature or not", async (context) => {
		assert.false(context.subject.isSecondSignature());

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.isSecondSignature(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have a transaction service", (context) => {
		assert.object(context.subject.transaction());
	});

	it("should return whether it has synced with network", async (context) => {
		context.subject = new Wallet(UUID.random(), {}, context.profile);
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.Address);

		assert.false(context.subject.hasSyncedWithNetwork());

		await context.subject.mutator().coin("ARK", "ark.devnet");
		await context.subject.mutator().identity(identity.mnemonic);

		await context.subject.synchroniser().identity();

		assert.true(context.subject.hasSyncedWithNetwork());
	});

	it("should return explorer link", (context) => {
		assert.is(context.subject.explorerLink(), "https://test.arkscan.io/wallets/D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
	});

	it("should turn into an object", (context) => {
		context.subject.data().set("key", "value");

		context.subject.data().set(WalletData.DerivationPath, "1");
		context.subject.data().set(WalletFlag.Starred, true);

		const actual = context.subject.toObject();

		assert.containKeys(actual, ["id", "data", "settings"]);
		assert.string(actual.id);
		assert.is(actual.data[WalletData.Address], "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW");
		assert.is(actual.data[WalletData.Coin], "ARK");
		assert.is(actual.data[WalletData.Network], "ark.devnet");
		assert.is(
			actual.data[WalletData.PublicKey],
			"030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
		);
		assert.equal(actual.data, {
			ADDRESS: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			BALANCE: { available: "55827093444556", fees: "55827093444556" },
			BROADCASTED_TRANSACTIONS: {},
			COIN: "ARK",
			DERIVATION_PATH: "1",
			DERIVATION_TYPE: "bip39",
			ENCRYPTED_CONFIRM_KEY: undefined,
			ENCRYPTED_SIGNING_KEY: undefined,
			IMPORT_METHOD: "BIP39.MNEMONIC",
			LEDGER_MODEL: undefined,
			NETWORK: "ark.devnet",
			PENDING_MULTISIGNATURE_TRANSACTIONS: {},
			PUBLIC_KEY: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
			SEQUENCE: "111932",
			SIGNED_TRANSACTIONS: {},
			STARRED: true,
			STATUS: "COLD",
			VOTES: [],
			VOTES_AVAILABLE: 0,
			VOTES_USED: 0,
			IS_PRIMARY: false,
		});
		assert.object(actual.settings);
		assert.string(actual.settings.AVATAR);
	});

	it("should have a primary key", (context) => {
		assert.is(context.subject.primaryKey(), context.subject.address());
	});

	it("should throw if the primary key is accessed before the wallet has been synchronized", async (context) => {
		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.primaryKey(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should have an underlying `WalletData` instance", (context) => {
		assert.is(context.subject.toData().primaryKey(), context.subject.address());
	});

	it("should throw if the underlying `WalletData` instance is accessed before the wallet has been synchronized", async (context) => {
		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.throws(
			() => context.subject.toData().primaryKey(),
			"This wallet has not been synchronized yet. Please call [synchroniser().identity()] before using it.",
		);
	});

	it("should return whether it can vote or not", (context) => {
		context.subject.data().set(WalletData.VotesAvailable, 0);

		assert.false(context.subject.canVote());

		context.subject.data().set(WalletData.VotesAvailable, 2);

		assert.true(context.subject.canVote());
	});

	it("should construct a coin instance", async (context) => {
		const mockConstruct = stub(context.subject.getAttributes().get("coin"), "__construct");

		await context.subject.connect();

		mockConstruct.calledOnce();
	});

	it("should throw if a connection is tried to be established but no coin has been set", async (context) => {
		context.subject = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		stub(context.subject, "hasCoin").returnValue(false);

		await assert.rejects(() => context.subject.connect());
	});

	it("should determine if the wallet has a coin attached to it", async (context) => {
		assert.true(context.subject.hasCoin());

		context.subject = new Wallet(UUID.random(), {}, context.profile);

		assert.false(context.subject.hasCoin());
	});

	it("should determine if the wallet has been fully restored", async (context) => {
		context.subject = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		context.subject.markAsPartiallyRestored();

		assert.false(context.subject.hasBeenFullyRestored());

		context.subject.markAsFullyRestored();

		assert.true(context.subject.hasBeenFullyRestored());
	});

	it("should determine if the wallet has been partially restored", async (context) => {
		context.subject = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		assert.false(context.subject.hasBeenPartiallyRestored());

		context.subject.markAsPartiallyRestored();

		assert.true(context.subject.hasBeenPartiallyRestored());
	});

	it("should determine if the wallet can perform write actions", (context) => {
		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.Address);

		assert.false(context.subject.canWrite());

		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.PublicKey);

		assert.false(context.subject.canWrite());

		context.subject.data().set(WalletData.ImportMethod, WalletImportMethod.PrivateKey);

		assert.true(context.subject.canWrite());
	});

	it("should determine if the wallet acts with mnemonic", (context) => {
		assert.boolean(context.subject.actsWithMnemonic());
	});

	it("should determine if the wallet acts with address", (context) => {
		assert.boolean(context.subject.actsWithAddress());
	});

	it("should determine if the wallet acts with public key", (context) => {
		assert.boolean(context.subject.actsWithPublicKey());
	});

	it("should determine if the wallet acts with private key", (context) => {
		assert.boolean(context.subject.actsWithPrivateKey());
	});

	it("should determine if the wallet acts with address with ledger path", (context) => {
		assert.boolean(context.subject.actsWithAddressWithDerivationPath());
	});

	it("should determine if the wallet acts with mnemonic with encryption", (context) => {
		assert.boolean(context.subject.actsWithMnemonicWithEncryption());
	});

	it("should determine if the wallet acts with wif", (context) => {
		assert.boolean(context.subject.actsWithWif());
	});

	it("should determine if the wallet acts with wif with encryption", (context) => {
		assert.boolean(context.subject.actsWithWifWithEncryption());
	});

	it("should determine if the wallet acts with a secret", (context) => {
		assert.boolean(context.subject.actsWithSecret());
	});

	it("should determine if the wallet acts with a secret with encryption", (context) => {
		assert.boolean(context.subject.actsWithSecretWithEncryption());
	});

	it("should have a signing key instance", (context) => {
		assert.instance(context.subject.signingKey(), WalletImportFormat);
	});

	it("should have a confirmation key instance", (context) => {
		assert.instance(context.subject.confirmKey(), WalletImportFormat);
	});

	it("should determine if wallet is is a cold wallet", async (context) => {
		assert.boolean(context.subject.isCold());
	});

	it("should determine if the wallet is marked as primary", (context) => {
		assert.boolean(context.subject.isPrimary());
	});

	it("should unset cold wallet status if outgoing transaction is found", async (context) => {
		context.subject = await context.profile.walletFactory().fromAddress({
			address: "DBk4cPYpqp7EBcvkstVDpyX7RQJNHxpMg8",
			coin: "ARK",
			network: "ark.devnet",
		});

		assert.true(context.subject.isCold());

		await context.subject.transactionIndex().all();

		assert.false(context.subject.isCold());
	});

	it("should determine if a wallet uses an encryption password", async (context) => {
		assert.false(context.subject.usesPassword());

		await context.subject.signingKey().set(identity.mnemonic, "password");

		assert.true(context.subject.usesPassword());
	});

	it("should have a signatory factory", (context) => {
		assert.instance(context.subject.signatoryFactory(), SignatoryFactory);
	});
});
