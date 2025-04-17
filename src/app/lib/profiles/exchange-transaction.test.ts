// import { describe } from "@ardenthq/sdk-test";
//

// import { bootContainer } from "../test/mocking";
// import { ExchangeTransaction } from "./exchange-transaction.js";
// import { ExchangeTransactionStatus } from "./exchange-transaction.enum";
// import { Profile } from "./profile";

// beforeAll(() => bootContainer());

// const stubData = {
// 	orderId: "orderId",
// 	provider: "provider",
// 	input: {
// 		amount: 1,
// 		ticker: "btc",
// 		address: "inputAddress",
// 	},
// 	output: {
// 		amount: 100,
// 		ticker: "ark",
// 		address: "outputAddress",
// 	},
// };

// let subject;
// let dateNowSpy;

// beforeAll(() => {
// 	dateNowSpy = stub(Date, "now").callsFake(() => 123456789);
// });

// beforeEach(() => {
// 	const profile = new Profile({ id: "uuid", name: "name", avatar: "avatar", data: "" });

// 	subject = new ExchangeTransaction(
// 		{
// 			id: "uuid",
// 			orderId: "orderId",
// 			provider: "provider",
// 			input: {
// 				amount: 1,
// 				ticker: "btc",
// 				address: "inputAddress",
// 			},
// 			output: {
// 				amount: 100,
// 				ticker: "ark",
// 				address: "outputAddress",
// 			},
// 		},
// 		profile,
// 	);
// });

// it("should have an id", () => {
// 	assert.is(subject.id(), "uuid");
// });

// it("should have an orderId", () => {
// 	assert.is(subject.orderId(), "orderId");
// });

// it("should have an input object", () => {
// 	assert.is(subject.input().amount, 1);
// });

// it("should have an output amount", () => {
// 	assert.is(subject.output().amount, 100);
// });

// it("should be able to change output", () => {
// 	subject.setOutput({ ...subject.output(), amount: 1000 });
// 	assert.is(subject.output().amount, 1000);
// });

// it("should have a timestamp", () => {
// 	assert.is(subject.createdAt(), 123456789);
// });

// it("should have a status", () => {
// 	assert.is(subject.status(), ExchangeTransactionStatus.New);
// });

// it("should be able to change status", () => {
// 	subject.setStatus(ExchangeTransactionStatus.Finished);
// 	assert.is(subject.status(), ExchangeTransactionStatus.Finished);
// });

// it("should check if the transaction is expired", () => {
// 	assert.false(subject.isExpired());

// 	subject.setStatus(ExchangeTransactionStatus.Expired);

// 	assert.true(subject.isExpired());
// });

// it("should check if the transaction is failed", () => {
// 	assert.false(subject.isFailed());

// 	subject.setStatus(ExchangeTransactionStatus.Failed);

// 	assert.true(subject.isFailed());
// });

// it("should check if the transaction is finished", () => {
// 	assert.false(subject.isFinished());

// 	subject.setStatus(ExchangeTransactionStatus.Finished);

// 	assert.true(subject.isFinished());
// });

// it("should check if the transaction is pending", () => {
// 	assert.true(subject.isPending());

// 	subject.setStatus(ExchangeTransactionStatus.Failed);

// 	assert.false(subject.isPending());
// });

// it("should check if the transaction is refunded", () => {
// 	assert.false(subject.isRefunded());

// 	subject.setStatus(ExchangeTransactionStatus.Refunded);

// 	assert.true(subject.isRefunded());
// });

// it("should map to object", () => {
// 	assert.equal(subject.toObject(), {
// 		id: "uuid",
// 		createdAt: 123456789,
// 		status: ExchangeTransactionStatus.New,
// 		...stubData,
// 	});
// });

// });

// @TODO: restore is leaking
