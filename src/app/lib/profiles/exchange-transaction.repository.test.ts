// import { describe } from "@ardenthq/sdk-test";
//

// import { bootContainer } from "../test/mocking";
// import { ExchangeTransactionRepository } from "./exchange-transaction.repository";
// import { ExchangeTransactionStatus } from "./contracts";
// import { Profile } from "./profile";

// beforeAll(() => bootContainer());

// const stubData = {
// 	orderId: "orderId",
// 	provider: "provider",
// 	input: {
// 		address: "inputAddress",
// 		amount: 1,
// 		ticker: "btc",
// 	},
// 	output: {
// 		address: "outputAddress",
// 		amount: 100,
// 		ticker: "ark",
// 	},
// };

// let subject;
// let dateNowSpy;

// beforeAll(() => {
// 	dateNowSpy = stub(Date, "now").callsFake(() => 123456789);
// });

// beforeEach(() => {
// 	const profile = new Profile({ id: "profile-id", name: "name", avatar: "avatar", data: "" });

// 	subject = new ExchangeTransactionRepository(profile);

// 	subject.flush();
// });

// it("#all", () => {
// 	assert.object(subject.all());
// });

// it("#create", () => {
// 	assert.length(subject.keys(), 0);

// 	const exchangeTransaction = subject.create(stubData);

// 	assert.length(subject.keys(), 1);

// 	assert.equal(exchangeTransaction.toObject(), {
// 		id: exchangeTransaction.id(),
// 		status: ExchangeTransactionStatus.New,
// 		createdAt: 123456789,
// 		...stubData,
// 	});

// 	assert.throws(
// 		() => subject.create(stubData),
// 		`The exchange transaction [${stubData.provider} / ${stubData.orderId}] already exists.`,
// 	);

// 	assert.is(subject.count(), 1);
// });

// it("#find", () => {
// 	assert.throws(() => subject.findById("invalid"), "Failed to find");

// 	const exchangeTransaction = subject.create(stubData);

// 	assert.object(subject.findById(exchangeTransaction.id()));
// });

// it("#update", () => {
// 	assert.throws(() => subject.update("invalid", { status: ExchangeTransactionStatus.Finished }), "Failed to find");

// 	const exchangeTransaction = subject.create(stubData);

// 	subject.update(exchangeTransaction.id(), { status: ExchangeTransactionStatus.Finished });

// 	assert.is(subject.findById(exchangeTransaction.id()).status(), ExchangeTransactionStatus.Finished);

// 	subject.update(exchangeTransaction.id(), { output: { ...stubData.output, amount: 1000 } });

// 	assert.is(subject.findById(exchangeTransaction.id()).output().amount, 1000);

// 	subject.update(exchangeTransaction.id(), { input: { ...stubData.input, hash: "hash" } });

// 	assert.is(subject.findById(exchangeTransaction.id()).input().hash, "hash");
// });

// it("#forget", () => {
// 	assert.throws(() => subject.forget("invalid"), "Failed to find");

// 	const exchangeTransaction = subject.create(stubData);

// 	assert.length(subject.keys(), 1);

// 	subject.forget(exchangeTransaction.id());

// 	assert.length(subject.keys(), 0);

// 	assert.throws(() => subject.findById(exchangeTransaction.id()), "Failed to find");
// });

// it("#findByStatus", () => {
// 	subject.create(stubData);
// 	const exchangeTransaction = subject.create({ ...stubData, provider: "another provider" });

// 	exchangeTransaction.setStatus(ExchangeTransactionStatus.Finished);

// 	assert.length(subject.findByStatus(ExchangeTransactionStatus.New), 1);
// 	assert.length(subject.findByStatus(ExchangeTransactionStatus.Finished), 1);
// });

// it("#pending", () => {
// 	const exchangeTransaction = subject.create(stubData);

// 	assert.length(subject.pending(), 1);

// 	exchangeTransaction.setStatus(ExchangeTransactionStatus.Finished);

// 	assert.length(subject.pending(), 0);
// });

// it("#flush", () => {
// 	subject.create(stubData);

// 	assert.length(subject.keys(), 1);

// 	subject.flush();

// 	assert.length(subject.keys(), 0);
// });

// it("#toObject", () => {
// 	const exchangeTransaction = subject.create(stubData);

// 	assert.equal(subject.toObject(), {
// 		[exchangeTransaction.id()]: {
// 			id: exchangeTransaction.id(),
// 			status: ExchangeTransactionStatus.New,
// 			createdAt: 123456789,
// 			...stubData,
// 		},
// 	});
// });

// it("#fill", () => {
// 	const exchangeTransactions = {
// 		id: {
// 			id: "id",
// 			status: ExchangeTransactionStatus.New,
// 			createdAt: 123456789,
// 			...stubData,
// 		},
// 	};

// 	assert.is(subject.count(), 0);

// 	subject.fill(exchangeTransactions);

// 	assert.is(subject.count(), 1);

// 	assert.equal(subject.values()[0].toObject(), Object.values(exchangeTransactions)[0]);
// });

// });

// @TODO: restore is leaking
