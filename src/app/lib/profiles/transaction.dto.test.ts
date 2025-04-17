import { BigNumber } from "@ardenthq/sdk-helpers";
import { DateTime } from "@ardenthq/sdk-intl";
import { describe } from "@ardenthq/sdk-test";

import { identity } from "../test/fixtures/identity";
import { data as secondWallet } from "../test/fixtures/wallets/D5sRKWckH4rE1hQ9eeMeHAepgyC3cvJtwb.json";
import { bootContainer, importByMnemonic } from "../test/mocking";
import { container } from "./container";
import { Identifiers } from "./container.models";
import { ProfileSetting } from "./contracts";
import { Profile } from "./profile";
import { ExtendedConfirmedTransactionData } from "./transaction.dto.js";

const mnemonic = identity.mnemonic;

const createSubject = (wallet, properties, klass) => {
	let meta = "some meta";

	return new klass(wallet, {
		amount: () => BigNumber.make(18e8, 8),
		asset: () => ({}),
		blockId: () => "transactionBlockId",
		bridgechainId: () => "bridgechainId",
		confirmations: () => BigNumber.make(20),
		fee: () => BigNumber.make(2e8, 8),
		getMeta: () => meta,
		id: () => "transactionId",
		inputs: () => [],
		isReturn: () => false,
		isSent: () => true,
		memo: () => "memo",
		outputs: () => [],
		recipient: () => "recipient",
		recipients: () => [],
		sender: () => "sender",
		setMeta: (key, value) => {
			meta = value;
		},
		timestamp: () => {},
		toObject: () => ({}),
		type: () => "some type",
		...properties,
	});
};

const beforeEachCallback = async (context, { loader, nock, stub }) => {
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
		.get("/api/delegates")
		.reply(200, loader.json("test/fixtures/client/delegates-1.json"))
		.get("/api/delegates?page=2")
		.reply(200, loader.json("test/fixtures/client/delegates-2.json"))
		.get("/api/ipfs/QmR45FmbVVrixReBwJkhEKde2qwHYaQzGxu4ZoDeswuF9c")
		.reply(200, { data: "ipfs-content" })
		// CryptoCompare
		.get("/data/dayAvg")
		.query(true)
		.reply(200, { BTC: 0.000_050_48, ConversionType: { conversionSymbol: "", type: "direct" } })
		.get("/data/histoday")
		.query(true)
		.reply(200, loader.json("test/fixtures/markets/cryptocompare/historical.json"))
		.persist();

	context.profile = new Profile({ avatar: "avatar", data: "", id: "profile-id", name: "name" });

	context.profile.settings().set(ProfileSetting.Name, "John Doe");
	context.profile.settings().set(ProfileSetting.ExchangeCurrency, "BTC");
	context.profile.settings().set(ProfileSetting.MarketProvider, "cryptocompare");

	context.wallet = await importByMnemonic(context.profile, mnemonic, "ARK", "ark.devnet");

	context.liveSpy = stub(context.wallet.network(), "isLive").returnValue(true);
	context.testSpy = stub(context.wallet.network(), "isTest").returnValue(false);
};

describe("ExtendedConfirmedTransactionData", ({ beforeEach, it, assert, stub, spy, loader, nock }) => {
	beforeEach(async (context) => {
		await beforeEachCallback(context, { loader, nock, stub });

		context.subject = createSubject(context.wallet, undefined, ExtendedConfirmedTransactionData);
	});

	it("should have an explorer link", (context) => {
		assert.is(context.subject.explorerLink(), "https://test.arkscan.io/transactions/transactionId");
	});

	it("should have an explorer block link", (context) => {
		assert.is(context.subject.explorerLinkForBlock(), "https://test.arkscan.io/blocks/transactionBlockId");
	});

	it("should have an explorer block link for undefined block", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				...context.subject,
				blockId: () => {},
			},
			ExtendedConfirmedTransactionData,
		);

		assert.undefined(subject.explorerLinkForBlock());
	});

	it("should have a type", (context) => {
		assert.is(context.subject.type(), "some type");
	});

	it("should have a timestamp", (context) => {
		assert.undefined(context.subject.timestamp());
	});

	it("should have confirmations", (context) => {
		assert.equal(context.subject.confirmations(), BigNumber.make(20));
	});

	it("should have a sender", (context) => {
		assert.is(context.subject.sender(), "sender");
	});

	it("should have a recipient", (context) => {
		assert.is(context.subject.recipient(), "recipient");
	});

	it("should have a recipients", (context) => {
		assert.instance(context.subject.recipients(), Array);
		assert.is(context.subject.recipients().length, 0);
	});

	it("should have an amount", (context) => {
		assert.equal(context.subject.amount(), 18);
	});

	it("should have a converted amount", async (context) => {
		const subject = createSubject(
			context.wallet,
			{
				amount: () => BigNumber.make(10e8, 8),
				timestamp: () => DateTime.make(),
			},
			ExtendedConfirmedTransactionData,
		);

		await container.get(Identifiers.ExchangeRateService).syncAll(context.profile, "DARK");

		assert.is(subject.convertedAmount(), 0.000_504_8);
	});

	it("should have a default converted amount", (context) => {
		assert.equal(context.subject.convertedAmount(), 0);
	});

	it("should have a fee", (context) => {
		assert.equal(context.subject.fee(), 2);
	});

	it("should have a converted fee", async (context) => {
		const subject = createSubject(
			context.wallet,
			{
				fee: () => BigNumber.make(10e8, 8),
				timestamp: () => DateTime.make(),
			},
			ExtendedConfirmedTransactionData,
		);

		await container.get(Identifiers.ExchangeRateService).syncAll(context.profile, "DARK");

		assert.is(subject.convertedFee(), 0.000_504_8);
	});

	it("should have a default converted fee", (context) => {
		assert.equal(context.subject.convertedFee(), 0);
	});

	it("#toObject", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				toObject: () => ({
					key: "value",
				}),
			},
			ExtendedConfirmedTransactionData,
		);

		assert.equal(subject.toObject(), {
			key: "value",
		});
	});

	it("#memo", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				memo: () => "memo",
			},
			ExtendedConfirmedTransactionData,
		);

		assert.is(subject.memo(), "memo");
	});

	it("#inputs", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				inputs: () => [{}, {}, {}],
			},
			ExtendedConfirmedTransactionData,
		);

		assert.length(subject.inputs(), 3);
	});

	it("#outputs", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				outputs: () => [{}, {}, {}],
			},
			ExtendedConfirmedTransactionData,
		);

		assert.length(subject.outputs(), 3);
	});

	it("should not throw if transaction type does not have memo", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				memo: undefined,
			},
			ExtendedConfirmedTransactionData,
		);

		assert.not.throws(() => subject.memo());
		assert.undefined(subject.memo());
	});

	it("#hasPassed", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				hasPassed: () => true,
			},
			ExtendedConfirmedTransactionData,
		);

		assert.true(subject.hasPassed());
	});

	it("coin", (context) => {
		assert.is(context.subject.coin(), context.wallet.coin());
	});

	it("#hasFailed", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				hasFailed: () => true,
			},
			ExtendedConfirmedTransactionData,
		);

		assert.true(subject.hasFailed());
	});

	it("#isReturn", (context) => {
		const subject = createSubject(
			context.wallet,
			{
				isReturn: () => true,
			},
			ExtendedConfirmedTransactionData,
		);

		assert.true(subject.isReturn());
	});

	it("#getMeta | #setMeta", (context) => {
		const getMeta = spy();
		const setMeta = spy();

		const subject = createSubject(context.wallet, { getMeta, setMeta }, ExtendedConfirmedTransactionData);

		subject.getMeta("key");
		subject.setMeta("key", "value");

		assert.true(getMeta.callCount > 0);
		assert.true(setMeta.callCount > 0);
	});

	it("should not have a memo", (context) => {
		assert.is(context.subject.memo(), "memo");
	});

	it("should have a total for sent", (context) => {
		assert.equal(context.subject.total(), 20);
	});

	it("should have a total for unsent", (context) => {
		const subject = new ExtendedConfirmedTransactionData(context.wallet, {
			amount: () => BigNumber.make(18e8, 8),
			fee: () => BigNumber.make(2e8, 8),
			isMultiPayment: () => false,
			isReturn: () => false,
			isSent: () => false,
		});

		assert.equal(subject.total(), 18);
	});

	it("should calculate total amount of the multi payments for unsent", (context) => {
		const subject = new ExtendedConfirmedTransactionData(context.wallet, {
			amount: () => BigNumber.make(18e8, 8),
			fee: () => BigNumber.make(2e8, 8),
			isMultiPayment: () => true,
			isReturn: () => false,
			isSent: () => false,
			recipients: () => [
				{
					address: context.wallet.address(),
					amount: BigNumber.make(5e8, 8),
				},
				{
					address: secondWallet.address,
					amount: BigNumber.make(6e8, 8),
				},
				{
					address: context.wallet.address(),
					amount: BigNumber.make(7e8, 8),
				},
			],
		});

		assert.equal(subject.amount(), 18);
		assert.equal(subject.total(), 12);
	});

	it("should have a converted total", async (context) => {
		const subject = createSubject(
			context.wallet,
			{
				amount: () => BigNumber.make(10e8, 8),
				fee: () => BigNumber.make(5e8, 8),
				timestamp: () => DateTime.make(),
			},
			ExtendedConfirmedTransactionData,
		);

		await container.get(Identifiers.ExchangeRateService).syncAll(context.profile, "DARK");

		assert.is(subject.convertedTotal(), 0.000_757_2);
	});

	it("should have a default converted total", (context) => {
		assert.equal(context.subject.convertedTotal(), 0);
	});

	it("should have meta", (context) => {
		assert.equal(context.subject.getMeta("someKey"), "some meta");
	});

	it("should change meta", (context) => {
		context.subject.setMeta("someKey", "another meta");
		assert.equal(context.subject.getMeta("someKey"), "another meta");
	});

	const data = [
		["isMagistrate"],
		["isDelegateRegistration"],
		["isDelegateResignation"],
		["isHtlcClaim"],
		["isHtlcLock"],
		["isHtlcRefund"],
		["isIpfs"],
		["isMultiPayment"],
		["isMultiSignatureRegistration"],
		["isSecondSignature"],
		["isTransfer"],
		["isVote"],
		["isUnvote"],
		["hasPassed"],
		["hasFailed"],
		["isConfirmed"],
		["isSent"],
		["isReceived"],
		["isTransfer"],
		["isVoteCombination"],
	];

	const dummyTransactionData = {
		hasPassed: () => false,
		isDelegateRegistration: () => false,
		isDelegateResignation: () => false,
		isHtlcClaim: () => false,
		isHtlcLock: () => false,
		isHtlcRefund: () => false,
		isIpfs: () => false,
		isMagistrate: () => false,
		isMultiPayment: () => false,
		isMultiSignatureRegistration: () => false,
		isSecondSignature: () => false,
		isTransfer: () => false,
		isUnvote: () => false,
		isVote: () => false,
	};

	// it.each(data)(`should delegate %p correctly`, (functionName) => {
	//     // @ts-ignore
	//     const transactionData = new ExtendedConfirmedTransactionData(wallet, {
	//         ...dummyTransactionData,
	//         [String(functionName)]: () => true,
	//     });
	//     assert.truthy(transactionData[functionName.toString()]());
	// });
});

// describe("DelegateRegistrationData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				username: () => "username",
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#username", () => {
// 		assert.is(subject.username(), "username");
// 	});
// });

// describe("DelegateResignationData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach((context) => (subject = createSubject(wallet, undefined, ExtendedConfirmedTransactionData)));

// 	it("#id", () => {
// 		assert.is(subject.id(), "transactionId");
// 	});
// });

// describe("HtlcClaimData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				lockTransactionId: () => "lockTransactionId",
// 				unlockSecret: () => "unlockSecret",
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#lockTransactionId", () => {
// 		assert.is(subject.lockTransactionId(), "lockTransactionId");
// 	});

// 	it("#unlockSecret", () => {
// 		assert.is(subject.unlockSecret(), "unlockSecret");
// 	});
// });

// describe("HtlcLockData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				secretHash: () => "secretHash",
// 				expirationType: () => 5,
// 				expirationValue: () => 3,
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#secretHash", () => {
// 		assert.is(subject.secretHash(), "secretHash");
// 	});

// 	it("#expirationType", () => {
// 		assert.is(subject.expirationType(), 5);
// 	});

// 	it("#expirationValue", () => {
// 		assert.is(subject.expirationValue(), 3);
// 	});
// });

// describe("HtlcRefundData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				lockTransactionId: () => "lockTransactionId",
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#lockTransactionId", () => {
// 		assert.is(subject.lockTransactionId(), "lockTransactionId");
// 	});
// });

// describe("IpfsData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				hash: () => "hash",
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#hash", () => {
// 		assert.is(subject.hash(), "hash");
// 	});
// });

// describe("MultiPaymentData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				payments: () => [{ recipientId: "recipientId", amount: BigNumber.make(1000, 8).times(1e8) }],
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#payments", () => {
// 		assert.equal(subject.payments(), [{ recipientId: "recipientId", amount: 1000 }]);
// 	});
// });

// describe("MultiSignatureData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				publicKeys: () => ["1", "2", "3"],
// 				min: () => 5,
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#publicKeys", () => {
// 		assert.equal(subject.publicKeys(), ["1", "2", "3"]);
// 	});

// 	it("#min", () => {
// 		assert.is(subject.min(), 5);
// 	});
// });

// describe("SecondSignatureData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				secondPublicKey: () => "secondPublicKey",
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#secondPublicKey", () => {
// 		assert.is(subject.secondPublicKey(), "secondPublicKey");
// 	});
// });

// describe("TransferData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(async () => {
// 		beforeEachCallback();

// 		subject = createSubject(
// 			wallet,
// 			{
// 				memo: () => "memo",
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#memo", () => {
// 		assert.is(subject.memo(), "memo");
// 	});
// });

// describe("VoteData", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				votes: () => ["vote"],
// 				unvotes: () => ["unvote"],
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("#votes", () => {
// 		assert.equal(subject.votes(), ["vote"]);
// 	});

// 	it("#unvotes", () => {
// 		assert.equal(subject.unvotes(), ["unvote"]);
// 	});
// });

// describe("Type Specific", ({ afterEach, beforeEach, test }) => {
// 	beforeEach(() => {
// 		subject = createSubject(
// 			wallet,
// 			{
// 				asset: () => ({ key: "value" }),
// 			},
// 			ExtendedConfirmedTransactionData,
// 		);
// 	});

// 	it("should return the asset", () => {
// 		assert.equal(subject.asset(), { key: "value" });
// 	});
// });
