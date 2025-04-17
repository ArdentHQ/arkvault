import { ProfileSetting, WalletData } from "./contracts";

import { ExtendedSignedTransactionData } from "./signed-transaction.dto.js";
import { Profile } from "./profile";
import { Signatories } from "@ardenthq/sdk";
import { TransactionService } from "./wallet-transaction.service.js";
import { bootContainer } from "../test/mocking";
import { describe } from "@ardenthq/sdk-test";
import { identity } from "../test/fixtures/identity";

const deriveIdentity = async (wallet, signingKey) => ({
	address: (await wallet.addressService().fromMnemonic(signingKey)).address,
	privateKey: (await wallet.privateKeyService().fromMnemonic(signingKey)).privateKey,
	publicKey: (await wallet.publicKeyService().fromMnemonic(signingKey)).publicKey,
	signingKey,
});

describe("ARK", ({ beforeAll, beforeEach, skip, it, nock, stub, assert, loader }) => {
	beforeAll(() => {
		bootContainer();
	});

	beforeEach(async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.get("/api/blockchain")
			.reply(200, loader.json("test/fixtures/client/blockchain.json"))
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
			.get("/transaction/a7245dcc720d3e133035cff04b4a14dbc0f8ff889c703c89c99f2f03e8f3c59d")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/musig-transaction.json"))
			.get("/transaction/bb9004fa874b534905f9eff201150f7f982622015f33e076c52f1e945ef184ed")
			.query(true)
			.reply(200, () => ({ data: loader.json("test/fixtures/client/transactions.json").data[1] }))
			.persist();

		context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
		context.profile.settings().set(ProfileSetting.Name, "John Doe");

		context.wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		await context.wallet.synchroniser().identity();

		context.subject = new TransactionService(context.wallet);
	});

	it("should sync", async (context) => {
		const musig = loader.json("test/fixtures/client/musig-transaction.json");
		nock.fake("https://ark-test.arkvault.io:443").get("/transactions").query(true).reply(200, [musig]).persist();
		await assert.resolves(() => context.subject.sync());
	});

	it("should add signature", async (context) => {
		nock.fake("https://ark-test-musig.arkvault.io:443")
			.post("/", {
				publicKey: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
				state: "pending",
			})
			.reply(200, {
				result: [
					{
						data: {
							id: "505e385d08e211b83fa6cf304ad67f42ddbdb364d767fd65354eb5a620b9380f",
							signatures: [],
						},
						multisigAsset: {},
					},
				],
			})
			.post("/", {
				publicKey: "030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
				state: "ready",
			})
			.reply(200, {
				result: [
					{
						data: {
							id: "505e385d08e211b83fa6cf304ad67f42ddbdb364d767fd65354eb5a620b9380f",
							signatures: [],
						},
						multisigAsset: {},
					},
				],
			})
			.post("/", {
				id: "505e385d08e211b83fa6cf304ad67f42ddbdb364d767fd65354eb5a620b9380f",
			})
			.reply(200, {
				result: {
					data: { signatures: [] },
					multisigAsset: {},
				},
			})
			.post("/", ({ method }) => method === "store")
			.reply(200, {
				result: {
					id: "505e385d08e211b83fa6cf304ad67f42ddbdb364d767fd65354eb5a620b9380f",
				},
			})
			.persist();

		const identity1 = await deriveIdentity(
			context.wallet,
			"citizen door athlete item name various drive onion foster audit board myself",
		);

		const identity2 = await deriveIdentity(
			context.wallet,
			"upset boat motor few ketchup merge punch gesture lecture piano neutral uniform",
		);

		const id = await context.subject.signMultiSignature({
			data: {
				min: 1,
				publicKeys: [identity1.publicKey, identity2.publicKey],
				senderPublicKey: "0205d9bbe71c343ac9a6a83a4344fd404c3534fc7349827097d0835d160bc2b896",
			},
			nonce: "1",
			signatory: new Signatories.Signatory(new Signatories.MnemonicSignatory(identity1)),
		});

		await context.subject.sync();
		await context.subject.addSignature(id, new Signatories.Signatory(new Signatories.MnemonicSignatory(identity2)));

		assert.defined(context.subject.transaction(id));
	});

	it("should sign second signature", async (context) => {
		const input = {
			data: {
				mnemonic: "this is a top secret second mnemonic",
			},
			nonce: "1",
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};
		const id = await context.subject.signSecondSignature(input);

		assert.string(id);
		assert.containKey(context.subject.signed(), id);
		assert.instance(context.subject.transaction(id), ExtendedSignedTransactionData);
	});

	it("should sign multi signature registration", async (context) => {
		const identity1 = await deriveIdentity(
			context.wallet,
			"upset boat motor few ketchup merge punch gesture lecture piano neutral uniform",
		);
		const identity2 = await deriveIdentity(
			context.wallet,
			"citizen door athlete item name various drive onion foster audit board myself",
		);
		const identity3 = await deriveIdentity(
			context.wallet,
			"nuclear anxiety mandate board property fade chief mule west despair photo fiber",
		);

		const id = await context.subject.signMultiSignature({
			data: {
				min: 2,
				publicKeys: [identity1.publicKey, identity2.publicKey, identity3.publicKey],
				senderPublicKey: identity1.publicKey,
			},
			nonce: "1",
			signatory: new Signatories.Signatory(new Signatories.MnemonicSignatory(identity1)),
		});

		assert.string(id);
		assert.containKey(context.subject.waitingForOtherSignatures(), id);
		assert.instance(context.subject.waitingForOtherSignatures()[id], ExtendedSignedTransactionData);
		assert.false(context.subject.canBeSigned(id));
	});

	it("should sign ipfs", async (context) => {
		const input = {
			data: {
				hash: "QmR45FmbVVrixReBwJkhEKde2qwHYaQzGxu4ZoDeswuF9w",
			},
			nonce: "1",
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};
		const id = await context.subject.signIpfs(input);

		assert.string(id);
		assert.containKey(context.subject.signed(), id);
		assert.instance(context.subject.transaction(id), ExtendedSignedTransactionData);
	});

	it("should sign multi payment", async (context) => {
		const input = {
			data: {
				payments: [
					{ amount: 10, to: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9" },
					{ amount: 10, to: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9" },
					{ amount: 10, to: "DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9" },
				],
			},
			nonce: "1",
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};
		const id = await context.subject.signMultiPayment(input);

		assert.string(id);
		assert.containKey(context.subject.signed(), id);
		assert.instance(context.subject.transaction(id), ExtendedSignedTransactionData);
	});

	it("should sign delegate resignation", async (context) => {
		const input = {
			nonce: "1",
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};
		const id = await context.subject.signDelegateResignation(input);

		assert.string(id);
		assert.containKey(context.subject.signed(), id);
		assert.instance(context.subject.transaction(id), ExtendedSignedTransactionData);
	});

	it("#transaction lifecycle", async (context) => {
		const realHash = "819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef";

		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};
		const id = await context.subject.signTransfer(input);
		assert.string(id);
		assert.containKey(context.subject.signed(), id);
		assert.defined(context.subject.transaction(id));
		assert.not.containKey(context.subject.waitingForOurSignature(), id);
		assert.not.containKey(context.subject.waitingForOtherSignatures(), id);
		assert.true(context.subject.hasBeenSigned(id));
		assert.false(context.subject.hasBeenBroadcasted(id));
		assert.false(context.subject.hasBeenConfirmed(id));

		nock.fake("https://ark-test.arkvault.io:443")
			.post("/api/transactions")
			.reply(201, {
				data: {
					accept: [realHash],
					broadcast: [],
					excess: [],
					invalid: [],
				},
				errors: {},
			})
			.get(`/api/transactions/${realHash}`)
			.reply(200, { data: { confirmations: 51 } });

		assert.equal(await context.subject.broadcast(id), {
			accepted: [realHash],
			errors: {},
			rejected: [],
		});

		assert.containKey(context.subject.signed(), id);
		assert.containKey(context.subject.broadcasted(), id);
		assert.true(context.subject.isAwaitingConfirmation(id));
		assert.true(context.subject.hasBeenSigned(id));
		assert.true(context.subject.hasBeenBroadcasted(id));
		assert.false(context.subject.hasBeenConfirmed(id));
		assert.defined(context.subject.transaction(id));

		await context.subject.confirm(id);

		await assert.rejects(() => context.subject.confirm(null));

		assert.not.containKey(context.subject.signed(), id);
		assert.not.containKey(context.subject.broadcasted(), id);
		assert.false(context.subject.isAwaitingConfirmation(id));
	});

	it("#pending", async (context) => {
		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};
		const id = await context.subject.signTransfer(input);
		assert.string(id);
		assert.containKey(context.subject.signed(), id);
		assert.instance(context.subject.transaction(id), ExtendedSignedTransactionData);
		assert.containKey(context.subject.pending(), id);
	});

	it("should fail when using malformed transaction ID", async (context) => {
		assert.throws(() => context.subject.transaction());
	});

	it("should fail retrieving public key if wallet is lacking a public key", async (context) => {
		const walletPublicKeyMock = stub(context.wallet, "publicKey").returnValue();
		assert.throws(() => context.subject.getPublicKey());
		walletPublicKeyMock.restore();
	});

	it("#dump", async (context) => {
		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};

		const id = await context.subject.signTransfer(input);

		assert.string(id);
		assert.containKey(context.subject.signed(), id);

		assert.undefined(context.wallet.data().get(WalletData.SignedTransactions));
		context.subject.dump();
		assert.containKey(context.wallet.data().get(WalletData.SignedTransactions), id);
	});

	it("#restore", async (context) => {
		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};

		const id = await context.subject.signTransfer(input);

		assert.string(id);
		assert.containKey(context.subject.signed(), id);

		assert.undefined(context.wallet.data().get(WalletData.SignedTransactions));

		context.subject.dump();
		context.subject.restore();

		assert.containKey(context.wallet.data().get(WalletData.SignedTransactions), id);

		const mockedUndefinedStorage = stub(context.wallet.data(), "get").returnValue();
		context.subject.restore();
		mockedUndefinedStorage.restore();
		assert.containKey(context.wallet.data().get(WalletData.SignedTransactions), id);
	});

	it("sign a multisig transaction awaiting other signatures", async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.post("/")
			.reply(200, { result: [loader.json("test/fixtures/client/musig-transaction.json")] })
			.post("/")
			.reply(200, { result: [] })
			.persist();

		const identity1 = await deriveIdentity(
			context.wallet,
			"upset boat motor few ketchup merge punch gesture lecture piano neutral uniform",
		);
		const identity2 = await deriveIdentity(
			context.wallet,
			"citizen door athlete item name various drive onion foster audit board myself",
		);

		const id = await context.subject.signMultiSignature({
			data: {
				min: 2,
				publicKeys: [identity1.publicKey, identity2.publicKey],
				senderPublicKey: identity1.publicKey,
			},
			nonce: "1",
			signatory: new Signatories.Signatory(new Signatories.MnemonicSignatory(identity1)),
		});

		assert.defined(context.subject.transaction(id));
		assert.containKey(context.subject.pending(), id);
		assert.containKey(context.subject.waitingForOtherSignatures(), id);
		assert.false(context.subject.isAwaitingSignatureByPublicKey(id, identity1.publicKey));
		assert.true(context.subject.isAwaitingSignatureByPublicKey(id, identity2.publicKey));
	});

	it("should sync multisig transaction awaiting our signature", async (context) => {
		nock.fake("https://ark-test-musig.arkvault.io:443")
			.post("/")
			.reply(200, { result: [loader.json("test/fixtures/client/multisig-transaction-awaiting-our.json")] })
			.post("/")
			.reply(200, { result: [] })
			.persist();

		const id = "a7245dcc720d3e133035cff04b4a14dbc0f8ff889c703c89c99f2f03e8f3c59d";

		await context.subject.sync();
		assert.containKey(context.subject.waitingForOurSignature(), id);
	});

	it("should await signature by public ip", async (context) => {
		nock.fake("https://ark-test-musig.arkvault.io:443")
			.post("/")
			.reply(200, { result: [loader.json("test/fixtures/client/multisig-transaction-awaiting-signature.json")] })
			.post("/")
			.reply(200, { result: [] })
			.persist();

		const id = "46343c36bf7497b68e14d4c0fd713e41a737841b6a858fa41ef0eab6c4647938";

		await context.subject.sync();
		const mockNeedsWalletSignature = stub(
			context.wallet.coin().multiSignature(),
			"needsWalletSignature",
		).returnValue(true);

		assert.true(
			context.subject.isAwaitingSignatureByPublicKey(
				id,
				"030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
			),
		);
		mockNeedsWalletSignature.restore();
	});

	it("transaction should not await any signatures", async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.post("/")
			.reply(200, { result: [] })
			.post("/")
			.reply(200, { result: [loader.json("test/fixtures/client/multisig-transaction-awaiting-none.json")] })
			.persist();

		const id = "46343c36bf7497b68e14d4c0fd713e41a737841b6a858fa41ef0eab6c4647938";

		await context.subject.sync();
		assert.throws(() =>
			context.subject.isAwaitingSignatureByPublicKey(
				id,
				"030fde54605c5d53436217a2849d276376d0b0f12c71219cd62b0a4539e1e75acd",
			),
		);
	});

	it("should broadcast transaction", async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.post("/api/transactions")
			.reply(201, {
				data: {
					accept: ["819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef"],
					broadcast: [],
					excess: [],
					invalid: [],
				},
				errors: {},
			})
			.get("/api/transactions/819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef")
			.reply(200, { data: { confirmations: 1 } });

		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};

		const id = await context.subject.signTransfer(input);
		assert.defined(context.subject.transaction(id));
		await context.subject.broadcast(id);
		assert.containKey(context.subject.broadcasted(), id);
		assert.defined(context.subject.transaction(id));
	});

	it("should broadcast a transfer and confirm it", async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.post("/api/transactions")
			.reply(201, {
				data: {
					accept: ["819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef"],
					broadcast: [],
					excess: [],
					invalid: [],
				},
				errors: {},
			})
			.get("/api/transactions/819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef")
			.reply(200, { data: { confirmations: 51 } });

		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};

		const id = await context.subject.signTransfer(input);
		assert.defined(context.subject.transaction(id));
		await context.subject.broadcast(id);
		assert.containKey(context.subject.broadcasted(), id);
		await context.subject.confirm(id);
		assert.defined(context.subject.transaction(id));
		assert.true(context.subject.hasBeenConfirmed(id));
	});

	it("should broadcast multisignature transaction", async (context) => {
		nock.fake("https://ark-test-musig.arkvault.io:443")
			.post("/")
			.reply(200, { result: [loader.json("test/fixtures/client/multisig-transaction-awaiting-none.json")] })
			.post("/")
			.reply(200, { result: [] });

		nock.fake("https://ark-test.arkvault.io:443")
			.post("/transaction")
			.reply(201, {
				data: {
					accept: ["4b867a3aa16a1a298cee236a3a907b8bc50e139199525522bfa88b5a9bb11a78"],
					broadcast: [],
					excess: [],
					invalid: [],
				},
				errors: {},
			})
			.persist();

		const identity1 = await deriveIdentity(
			context.wallet,
			"upset boat motor few ketchup merge punch gesture lecture piano neutral uniform",
		);
		const identity2 = await deriveIdentity(
			context.wallet,
			"citizen door athlete item name various drive onion foster audit board myself",
		);

		const id = await context.subject.signMultiSignature({
			data: {
				min: 2,
				publicKeys: [identity1.publicKey, identity2.publicKey],
			},
			nonce: "1",
			signatory: new Signatories.Signatory(new Signatories.MnemonicSignatory(identity1)),
		});

		const isMultiSignatureRegistration = stub(context.subject.transaction(id), "isMultiSignatureRegistration");

		isMultiSignatureRegistration.returnValue(false);
		assert.defined(context.subject.transaction(id));
		assert.containKey(context.subject.pending(), id);
		assert.true(context.subject.transaction(id).usesMultiSignature());

		await context.subject.broadcast(id);
		assert.containKey(context.subject.waitingForOtherSignatures(), id);

		isMultiSignatureRegistration.returnValue(false);
		await context.subject.broadcast(id);
		assert.defined(context.subject.transaction(id));
	});

	it("should broadcast multisignature registration", async (context) => {
		nock.fake("https://ark-test-musig.arkvault.io:443")
			.post("/")
			.reply(200, { result: [loader.json("test/fixtures/client/musig-transaction.json")] });

		nock.fake("https://ark-test.arkvault.io:443")
			.post("/")
			.reply(200, { result: [] })
			.post("/transaction")
			.reply(201, {
				data: {
					accept: ["5d7b213905c3bf62bc233b7f1e211566b1fd7aecad668ed91bb8202b3f35d890"],
					broadcast: [],
					excess: [],
					invalid: [],
				},
				errors: {},
			})
			.persist();

		const identity1 = await deriveIdentity(
			context.wallet,
			"upset boat motor few ketchup merge punch gesture lecture piano neutral uniform",
		);
		const identity2 = await deriveIdentity(
			context.wallet,
			"citizen door athlete item name various drive onion foster audit board myself",
		);

		const id = await context.subject.signMultiSignature({
			data: {
				min: 2,
				publicKeys: [identity1.publicKey, identity2.publicKey],
			},
			nonce: "1",
			signatory: new Signatories.Signatory(new Signatories.MnemonicSignatory(identity1)),
		});

		assert.defined(context.subject.transaction(id));
		assert.containKey(context.subject.pending(), id);
		assert.true(context.subject.transaction(id).usesMultiSignature());
		assert.true(context.subject.transaction(id).isMultiSignatureRegistration());

		await context.subject.broadcast(id);
		assert.containKey(context.subject.waitingForOtherSignatures(), id);
	});

	skip("#confirm", async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.post("/api/transactions")
			.reply(201, {
				data: {
					accept: ["819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef"],
					broadcast: [],
					excess: [],
					invalid: [],
				},
				errors: {},
			})
			.get("/api/transactions/819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef")
			.reply(200, { data: { confirmations: 0 } });

		const input = {
			data: {
				amount: 1,
				to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
			},
			signatory: new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					privateKey: "privateKey",
					publicKey: "publicKey",
					signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
				}),
			),
		};

		const id = await context.subject.signTransfer(input);

		assert.object(context.subject.broadcast(id));
		assert.defined(context.subject.transaction(id));

		// Uncofirmed
		await context.subject.confirm(id);
		assert.true(context.subject.isAwaitingConfirmation(id));

		// Invalid id
		//@ts-ignore
		await assert.rejects(() => context.subject.confirm(null));

		// Handle wallet client error. Should return false
		const walletClientTransactionMock = stub(context.wallet.client(), "transaction").callsFake(() => {
			throw new Error("transaction error");
		});

		assert.is(await context.subject.confirm(id), false);
		walletClientTransactionMock.restore();

		// Confirmed

		nock.fake("https://ark-test.arkvault.io:443")
			.get("/api/transactions/819aa9902c194ce2fd48ae8789fa1b5273698c02b7ad91d0d561742567fd4cef")
			.reply(200, { data: { confirmations: 51 } });

		await context.subject.confirm(id);
		assert.false(context.subject.isAwaitingConfirmation(id));
	});

	it("should throw if a transaction is retrieved that does not exist", async (context) => {
		assert.throws(() => context.subject.transaction("id"), /could not be found/);
	});
});

describe("Shared", ({ afterEach, beforeAll, beforeEach, each, nock, assert, loader }) => {
	beforeAll(() => {
		bootContainer();
	});

	beforeEach(async (context) => {
		nock.fake("https://ark-test.arkvault.io:443")
			.get("/api/blockchain")
			.reply(200, loader.json("test/fixtures/client/blockchain.json"))
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
			.get("/transaction/a7245dcc720d3e133035cff04b4a14dbc0f8ff889c703c89c99f2f03e8f3c59d")
			.query(true)
			.reply(200, loader.json("test/fixtures/client/musig-transaction.json"))
			.get("/transaction/bb9004fa874b534905f9eff201150f7f982622015f33e076c52f1e945ef184ed")
			.query(true)
			.reply(200, () => ({ data: loader.json("test/fixtures/client/transactions.json").data[1] }))
			.persist();

		context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });
		context.profile.settings().set(ProfileSetting.Name, "John Doe");

		context.wallet = await context.profile.walletFactory().fromMnemonicWithBIP39({
			coin: "ARK",
			mnemonic: identity.mnemonic,
			network: "ark.devnet",
		});

		context.subject = new TransactionService(context.wallet);
	});

	afterEach(() => {});

	each(
		"should create a transfer for %s",
		async ({ context, dataset }) => {
			const subject = new TransactionService(
				await context.profile.walletFactory().fromMnemonicWithBIP39({
					coin: dataset.coin,
					mnemonic: identity.mnemonic,
					network: dataset.network,
				}),
			);

			const id = await subject.signTransfer(dataset.input);

			assert.string(id);
			assert.containKey(subject.signed(), id);
			assert.instance(subject.transaction(id), ExtendedSignedTransactionData);
			assert.is(subject.transaction(id).sender(), dataset.input.signatory.address());
			assert.is(subject.transaction(id).recipient(), dataset.input.data.to);
			assert.true(subject.transaction(id).isTransfer());
			assert.false(subject.transaction(id).isSecondSignature());
			assert.false(subject.transaction(id).isDelegateRegistration());
			assert.false(subject.transaction(id).isVoteCombination());
			assert.false(subject.transaction(id).isVote());
			assert.false(subject.transaction(id).isUnvote());
			assert.false(subject.transaction(id).isMultiSignatureRegistration());
			assert.false(subject.transaction(id).isIpfs());
			assert.false(subject.transaction(id).isMultiPayment());
			assert.false(subject.transaction(id).isDelegateResignation());
			assert.false(subject.transaction(id).isHtlcLock());
			assert.false(subject.transaction(id).isHtlcClaim());
			assert.false(subject.transaction(id).isHtlcRefund());
			assert.false(subject.transaction(id).isMagistrate());
			assert.false(subject.transaction(id).usesMultiSignature());
		},
		[
			{
				coin: "ARK",
				input: {
					data: {
						amount: 1,
						to: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
					},
					signatory: new Signatories.Signatory(
						new Signatories.MnemonicSignatory({
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							privateKey: "e2511a6022953eb399fbd48f84619c04c894f735aee107b02a7690075ae67617",
							publicKey: "39b49ead71b16c0b0330a6ba46c57183819936bfdf789dfd2452df4dc04f5a2a",
							signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
						}),
					),
				},
				network: "ark.devnet",
			},
		],
	);

	each(
		"should create a delegate registration for %s",
		async ({ context, dataset }) => {
			const subject = new TransactionService(
				await context.profile.walletFactory().fromMnemonicWithBIP39({
					coin: dataset.coin,
					mnemonic: identity.mnemonic,
					network: dataset.network,
				}),
			);

			const id = await subject.signDelegateRegistration(dataset.input);

			assert.string(id);
			assert.containKey(subject.signed(), id);
			assert.instance(subject.transaction(id), ExtendedSignedTransactionData);
			assert.is(subject.transaction(id).sender(), dataset.input.signatory.address());
			assert.undefined(subject.transaction(id).recipient());
			assert.false(subject.transaction(id).isTransfer());
			assert.false(subject.transaction(id).isSecondSignature());
			assert.true(subject.transaction(id).isDelegateRegistration());
			assert.false(subject.transaction(id).isVoteCombination());
			assert.false(subject.transaction(id).isVote());
			assert.false(subject.transaction(id).isUnvote());
			assert.false(subject.transaction(id).isMultiSignatureRegistration());
			assert.false(subject.transaction(id).isIpfs());
			assert.false(subject.transaction(id).isMultiPayment());
			assert.false(subject.transaction(id).isDelegateResignation());
			assert.false(subject.transaction(id).isHtlcLock());
			assert.false(subject.transaction(id).isHtlcClaim());
			assert.false(subject.transaction(id).isHtlcRefund());
			assert.false(subject.transaction(id).isMagistrate());
			assert.false(subject.transaction(id).usesMultiSignature());
		},
		[
			{
				coin: "ARK",
				input: {
					data: {
						username: "johndoe",
					},
					signatory: new Signatories.Signatory(
						new Signatories.MnemonicSignatory({
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							privateKey: "privateKey",
							publicKey: "publicKey",
							signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
						}),
					),
				},
				network: "ark.devnet",
			},
		],
	);

	each(
		"should create a vote for %s",
		async ({ context, dataset }) => {
			const subject = new TransactionService(
				await context.profile.walletFactory().fromMnemonicWithBIP39({
					coin: dataset.coin,
					mnemonic: identity.mnemonic,
					network: dataset.network,
				}),
			);

			const id = await subject.signVote(dataset.input);

			assert.string(id);
			assert.containKey(subject.signed(), id);
			assert.instance(subject.transaction(id), ExtendedSignedTransactionData);
			assert.is(subject.transaction(id).sender(), dataset.input.signatory.address());
			assert.undefined(subject.transaction(id).recipient());
			assert.false(subject.transaction(id).isTransfer());
			assert.false(subject.transaction(id).isSecondSignature());
			assert.false(subject.transaction(id).isDelegateRegistration());
			assert.false(subject.transaction(id).isVoteCombination());
			assert.true(subject.transaction(id).isVote());
			assert.false(subject.transaction(id).isUnvote());
			assert.false(subject.transaction(id).isMultiSignatureRegistration());
			assert.false(subject.transaction(id).isIpfs());
			assert.false(subject.transaction(id).isMultiPayment());
			assert.false(subject.transaction(id).isDelegateResignation());
			assert.false(subject.transaction(id).isHtlcLock());
			assert.false(subject.transaction(id).isHtlcClaim());
			assert.false(subject.transaction(id).isHtlcRefund());
			assert.false(subject.transaction(id).isMagistrate());
			assert.false(subject.transaction(id).usesMultiSignature());
		},
		[
			{
				coin: "ARK",
				input: {
					data: {
						unvotes: [],
						votes: [
							{
								amount: 0,
								id: "03bbfb43ecb5a54a1e227bb37b5812b5321213838d376e2b455b6af78442621dec",
							},
						],
					},
					signatory: new Signatories.Signatory(
						new Signatories.MnemonicSignatory({
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							privateKey: "privateKey",
							publicKey: "publicKey",
							signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
						}),
					),
				},
				network: "ark.devnet",
			},
		],
	);

	each(
		"should create an unvote for %s",
		async ({ context, dataset }) => {
			const subject = new TransactionService(
				await context.profile.walletFactory().fromMnemonicWithBIP39({
					coin: dataset.coin,
					mnemonic: identity.mnemonic,
					network: dataset.network,
				}),
			);

			const id = await subject.signVote(dataset.input);

			assert.string(id);
			assert.containKey(subject.signed(), id);
			assert.instance(subject.transaction(id), ExtendedSignedTransactionData);
			assert.is(subject.transaction(id).sender(), dataset.input.signatory.address());
			assert.undefined(subject.transaction(id).recipient());
			assert.false(subject.transaction(id).isTransfer());
			assert.false(subject.transaction(id).isSecondSignature());
			assert.false(subject.transaction(id).isDelegateRegistration());
			assert.false(subject.transaction(id).isVoteCombination());
			assert.false(subject.transaction(id).isVote());
			assert.true(subject.transaction(id).isUnvote());
			assert.false(subject.transaction(id).isMultiSignatureRegistration());
			assert.false(subject.transaction(id).isIpfs());
			assert.false(subject.transaction(id).isMultiPayment());
			assert.false(subject.transaction(id).isDelegateResignation());
			assert.false(subject.transaction(id).isHtlcLock());
			assert.false(subject.transaction(id).isHtlcClaim());
			assert.false(subject.transaction(id).isHtlcRefund());
			assert.false(subject.transaction(id).isMagistrate());
			assert.false(subject.transaction(id).usesMultiSignature());
		},
		[
			{
				coin: "ARK",
				input: {
					data: {
						unvotes: [
							{
								amount: 0,
								id: "03bbfb43ecb5a54a1e227bb37b5812b5321213838d376e2b455b6af78442621dec",
							},
						],
						votes: [],
					},
					signatory: new Signatories.Signatory(
						new Signatories.MnemonicSignatory({
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							privateKey: "privateKey",
							publicKey: "publicKey",
							signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
						}),
					),
				},
				network: "ark.devnet",
			},
		],
	);

	each(
		"should create a vote combination for %s",
		async ({ context, dataset }) => {
			const subject = new TransactionService(
				await context.profile.walletFactory().fromMnemonicWithBIP39({
					coin: dataset.coin,
					mnemonic: identity.mnemonic,
					network: dataset.network,
				}),
			);

			const id = await subject.signVote(dataset.input);

			assert.string(id);
			assert.containKey(subject.signed(), id);
			assert.instance(subject.transaction(id), ExtendedSignedTransactionData);
			assert.is(subject.transaction(id).sender(), dataset.input.signatory.address());
			assert.undefined(subject.transaction(id).recipient());
			assert.false(subject.transaction(id).isTransfer());
			assert.false(subject.transaction(id).isSecondSignature());
			assert.false(subject.transaction(id).isDelegateRegistration());
			assert.true(subject.transaction(id).isVoteCombination());
			assert.true(subject.transaction(id).isVote());
			assert.true(subject.transaction(id).isUnvote());
			assert.false(subject.transaction(id).isMultiSignatureRegistration());
			assert.false(subject.transaction(id).isIpfs());
			assert.false(subject.transaction(id).isMultiPayment());
			assert.false(subject.transaction(id).isDelegateResignation());
			assert.false(subject.transaction(id).isHtlcLock());
			assert.false(subject.transaction(id).isHtlcClaim());
			assert.false(subject.transaction(id).isHtlcRefund());
			assert.false(subject.transaction(id).isMagistrate());
			assert.false(subject.transaction(id).usesMultiSignature());
		},
		[
			{
				coin: "ARK",
				input: {
					data: {
						unvotes: [
							{
								amount: 0,
								id: "03bbfb43ecb5a54a1e227bb37b5812b5321213838d376e2b455b6af78442621dec",
							},
						],
						votes: [
							{
								amount: 0,
								id: "03bbfb43ecb5a54a1e227bb37b5812b5321213838d376e2b455b6af78442621dec",
							},
						],
					},
					signatory: new Signatories.Signatory(
						new Signatories.MnemonicSignatory({
							address: "D6i8P5N44rFto6M6RALyUXLLs7Q1A1WREW",
							privateKey: "privateKey",
							publicKey: "publicKey",
							signingKey: "bomb open frame quit success evolve gain donate prison very rent later",
						}),
					),
				},
				network: "ark.devnet",
			},
		],
	);
});
