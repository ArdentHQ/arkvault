import { describe, it, expect, beforeEach, vi } from "vitest";
import { UnconfirmedTransactionData } from "./unconfirmed-transaction.dto";
import { KeyValuePair } from "./transaction-data.dto";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import * as TransactionTypeServiceMock from "./transaction-type.service";

describe("UnconfirmedTransactionData", () => {
	let transaction: UnconfirmedTransactionData;
	let commonData: KeyValuePair;

	beforeEach(() => {
		transaction = new UnconfirmedTransactionData();

		commonData = {
			blockHash: "test_block_hash",
			data: "0x1234567890abcdef",
			from: "sender_address",
			gas: 21000,
			gasPrice: 10000000,
			hash: "test_hash",
			nonce: 1,
			senderPublicKey: "somePublicKey",
			timestamp: new Date().getTime(),
			to: "recipient_address",
			value: 100000000,
		};
	});

	it("should return voteCombination type when isVoteCombination is true", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.isVoteCombination = () => true;
		mockTransaction.configure(commonData);

		expect(mockTransaction.type()).toBe("voteCombination");
	});

	it("should return transfer type when isTransfer is true", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.isTransfer = () => true;
		mockTransaction.configure(commonData);

		expect(mockTransaction.type()).toBe("transfer");
	});

	it("should return identifier name when TransactionTypeService returns non-null", () => {
		const spy = vi
			.spyOn(TransactionTypeServiceMock.TransactionTypeService, "getIdentifierName")
			.mockReturnValue("customIdentifier");

		transaction.configure(commonData);
		const result = transaction.type();

		expect(result).toBe("customIdentifier");
		spy.mockRestore();
	});

	it("should return recipients for multi payment", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.isMultiPayment = () => true;
		mockTransaction.payments = () => [
			{ amount: new BigNumber(100), recipientId: "address1" },
			{ amount: new BigNumber(200), recipientId: "address2" },
		];
		mockTransaction.configure(commonData);

		const recipients = mockTransaction.recipients();

		expect(recipients).toHaveLength(2);
		expect(recipients[0]).toEqual({ address: "address1", amount: new BigNumber(100) });
		expect(recipients[1]).toEqual({ address: "address2", amount: new BigNumber(200) });
	});

	it("should return sum of payments for multi-payment value", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.isMultiPayment = () => true;
		mockTransaction.payments = () => [{ amount: new BigNumber(100) }, { amount: new BigNumber(200) }];
		mockTransaction.configure(commonData);

		const value = mockTransaction.value();
		expect(value).toEqual(new BigNumber(300));
	});

	it("should return true for isReturn when transfer and both sent and received", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.isTransfer = () => true;
		mockTransaction.isSent = () => true;
		mockTransaction.isReceived = () => true;
		mockTransaction.configure(commonData);

		expect(mockTransaction.isReturn()).toBe(true);
	});

	it("should return true for isReturn when multi-payment includes sender as recipient", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.isMultiPayment = () => true;
		mockTransaction.recipients = () => [{ address: "sender_address", amount: new BigNumber(100) }];
		mockTransaction.configure(commonData);

		expect(mockTransaction.isReturn()).toBe(true);
	});

	it("should return username from decoded function data", () => {
		const mockTransaction = new UnconfirmedTransactionData();

		const realEncodedData =
			"0x36a94134000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000087465737475736572000000000000000000000000000000000000000000000000";

		mockTransaction.configure({
			...commonData,
			data: realEncodedData,
		});

		const username = mockTransaction.username();
		expect(username).toBe("testuser");
	});

	it("should return validator public key from decoded function data", () => {
		const mockTransaction = new UnconfirmedTransactionData();

		const realEncodedData =
			"0x602a9eee00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890";

		mockTransaction.configure({
			...commonData,
			data: realEncodedData,
		});

		const validatorPublicKey = mockTransaction.validatorPublicKey();
		expect(validatorPublicKey).toBe("abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890");
	});

	it("should return votes array from decoded function data", () => {
		const mockTransaction = new UnconfirmedTransactionData();

		const realEncodedData = "0x6dd7d8ea000000000000000000000000abcdef1234567890abcdef1234567890abcdef12";

		mockTransaction.configure({
			...commonData,
			data: realEncodedData,
		});

		const votes = mockTransaction.votes();
		expect(votes).toEqual(["0xabCDEF1234567890ABcDEF1234567890aBCDeF12"]);
	});

	it("should return empty array for unvotes", () => {
		const mockTransaction = new UnconfirmedTransactionData();
		mockTransaction.configure(commonData);

		const unvotes = mockTransaction.unvotes();
		expect(unvotes).toEqual([]);
	});

	it("should return payments from decoded multi-payment function data", () => {
		const mockTransaction = new UnconfirmedTransactionData();

		const realEncodedData =
			"0x084ce708000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000800000000000000000000000000000000000000000000000000000000000000001000000000000000000000000123456789012345678901234567890123456789000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000de0b6b3a7640000";

		mockTransaction.configure({
			...commonData,
			data: realEncodedData,
		});

		const payments = mockTransaction.payments();
		expect(payments).toHaveLength(1);
		expect(payments[0]).toEqual({
			amount: expect.any(BigNumber),
			recipientId: "0x1234567890123456789012345678901234567890",
		});
	});

	it("should normalize data by converting public key to address", () => {
		const mockTransaction = new UnconfirmedTransactionData();

		const validPublicKey = "0293b9fd80d472bbf678404d593705268cf09324115f73103bc1477a3933350041";

		mockTransaction.configure({
			...commonData,
			senderPublicKey: validPublicKey,
		});

		expect(() => mockTransaction.normalizeData()).not.toThrow();
	});

	it("should be instantiated and configured", () => {
		expect(transaction.configure(commonData)).toBeInstanceOf(UnconfirmedTransactionData);
		expect(transaction.raw()).toEqual(commonData);
	});

	it("should set decimals correctly", () => {
		expect(transaction.withDecimals(8)).toBeInstanceOf(UnconfirmedTransactionData);
		expect(transaction.withDecimals("8")).toBeInstanceOf(UnconfirmedTransactionData);
	});

	it("should return correct type for transfer", () => {
		transaction.configure(commonData);
		expect(transaction.type()).toBe(commonData.data.slice(0, 10));
	});

	it("should return correct type for custom method", () => {
		transaction.configure({ ...commonData, data: "0x00002" });
		expect(transaction.type()).toBe("0x00002");
	});

	it("should return method hash if no other type matches", () => {
		transaction.configure({ ...commonData, data: "0xabcdef0123456789" });
		expect(transaction.type()).toBe("0xabcdef01");
	});

	it("#toObject", () => {
		transaction.configure(commonData);
		const object = transaction.toObject();
		expect(object.fee).toBeInstanceOf(BigNumber);
		expect(object.timestamp).toBeInstanceOf(DateTime);
		expect(object.value).toBeInstanceOf(BigNumber);
		expect(object.hash).toBe("test_hash");
		expect(object.from).toBe("sender_address");
		expect(object.to).toBe("recipient_address");
		expect(object.status).toBe("pending");
	});

	it("#toJSON", () => {
		transaction.configure(commonData);
		const json = transaction.toJSON();
		expect(json.from).toBe("sender_address");
		expect(json.to).toBe("recipient_address");
		expect(json.status).toBe("pending");
		expect(typeof json.fee).toBe("string");
		expect(typeof json.value).toBe("string");
	});

	it("#toHuman", () => {
		transaction.configure(commonData);
		const human = transaction.toHuman();
		expect(human.from).toBe("sender_address");
		expect(human.to).toBe("recipient_address");
		expect(human.status).toBe("pending");
	});

	it("#raw", () => {
		transaction.configure(commonData);
		expect(transaction.raw()).toEqual(commonData);
	});

	it("should determine if transaction has passed", () => {
		transaction.configure(commonData);
		expect(transaction.hasPassed()).toBe(true);
		transaction.configure({});
		expect(transaction.hasPassed()).toBe(false);
	});

	it("should determine if transaction has failed", () => {
		transaction.configure({});
		expect(transaction.hasFailed()).toBe(true);
		transaction.configure(commonData);
		expect(transaction.hasFailed()).toBe(false);
	});

	it("#getMeta", () => {
		transaction.setMeta("address", "test_address");
		expect(transaction.getMeta("address")).toBe("test_address");
	});

	it("#hash", () => {
		transaction.configure(commonData);
		expect(transaction.hash()).toBe("test_hash");
	});

	it("#nonce", () => {
		transaction.configure(commonData);
		expect(transaction.nonce()).toEqual(1);
	});

	it("#blockHash", () => {
		transaction.configure(commonData);
		expect(transaction.blockHash()).toBe("test_block_hash");
	});

	it("#timestamp", () => {
		transaction.configure(commonData);
		expect(transaction.timestamp()?.toISOString()).toBe("2020-07-01T00:00:00.000Z");
	});

	it("#from", () => {
		transaction.configure(commonData);
		expect(transaction.from()).toBe("sender_address");
	});

	it("should return to address", () => {
		transaction.configure(commonData);
		expect(transaction.to()).toBe("recipient_address");
	});

	it("should return empty recipients if not multi payment", () => {
		transaction.configure(commonData);
		expect(transaction.recipients()).toEqual([]);
	});

	it("should return value for transfer", () => {
		transaction.configure(commonData);
		expect(transaction.value()).toEqual(new BigNumber(100000000));
	});

	it("#fee", () => {
		transaction.configure(commonData);
		expect(transaction.fee()).toEqual(new BigNumber(210000000));
	});

	it("#isReturn", () => {
		transaction.configure(commonData);
		expect(transaction.isReturn()).toBe(false);
	});

	it("#isSent", () => {
		transaction.configure(commonData);
		transaction.setMeta("address", commonData.from);
		expect(transaction.isSent()).toBe(true);
		transaction.setMeta("address", commonData.to);
		expect(transaction.isSent()).toBe(false);
	});

	it("#isReceived", () => {
		transaction.configure(commonData);
		transaction.setMeta("address", "recipient_address");
		expect(transaction.isReceived()).toBe(true);
		transaction.setMeta("address", "other_address");
		expect(transaction.isReceived()).toBe(false);
	});

	it("#isTransfer", () => {
		transaction.configure({ ...commonData, data: "0x000000" });
		expect(transaction.isTransfer()).toBe(false);
	});

	it("#isSecondSignature", () => {
		transaction.configure(commonData);
		expect(transaction.isSecondSignature()).toBe(false);
	});

	it("isUsernameRegistration", () => {
		transaction.configure({ ...commonData, type: "usernameRegistration" });
		expect(transaction.isUsernameRegistration()).toBe(false);
	});

	it("#isUsernameResignation", () => {
		transaction.configure({ ...commonData, type: "usernameResignation" });
		expect(transaction.isUsernameResignation()).toBe(false);
	});

	it("#isValidatorRegistration", () => {
		transaction.configure({ ...commonData, type: "validatorRegistration" });
		expect(transaction.isValidatorRegistration()).toBe(false);
	});

	it("isVote", () => {
		transaction.configure(commonData);
		expect(transaction.isVote()).toBe(false);
	});

	it("#isUnvote", () => {
		transaction.configure(commonData);
		expect(transaction.isUnvote()).toBe(false);
	});

	it("#isMultiPayment", () => {
		transaction.configure(commonData);
		expect(transaction.isMultiPayment()).toBe(false);
	});

	it("#isValidatorResignation", () => {
		transaction.configure(commonData);
		expect(transaction.isValidatorResignation()).toBe(false);
	});

	it("#secondPublicKey", () => {
		transaction.configure({ ...commonData, asset: { signature: { publicKey: "second_pub_key" } } });
		expect(transaction.secondPublicKey()).toBe("second_pub_key");
	});

	it("#methodHash", () => {
		transaction.configure({ ...commonData, data: "0xabcdef0123456789" });
		expect(transaction.methodHash()).toBe("0xabcdef01");
	});

	it("#expirationType", () => {
		transaction.configure({ ...commonData, asset: { lock: { expiration: { type: 1 } } } });
		expect(transaction.expirationType()).toBe(1);
	});

	it("#expirationValue", () => {
		transaction.configure({ ...commonData, asset: { lock: { expiration: { value: 100 } } } });
		expect(transaction.expirationValue()).toBe(100);
	});

	// Unconfirmed-specific tests
	it("#isConfirmed", () => {
		transaction.configure(commonData);
		expect(transaction.isConfirmed()).toBe(false);
	});

	it("#isPending", () => {
		transaction.configure(commonData);
		expect(transaction.isPending()).toBe(true);
	});
});
