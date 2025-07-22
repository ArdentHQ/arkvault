import { describe, it, expect, beforeEach, vi } from "vitest";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto";
import { KeyValuePair } from "./contracts";
import { BigNumber } from "@/app/lib/helpers";
import { DateTime } from "@/app/lib/intl";
import { Exceptions } from ".";
import * as TransactionTypeServiceMock from "./transaction-type.service";

describe("ConfirmedTransactionData", () => {
	let transaction: ConfirmedTransactionData;
	let commonData: KeyValuePair;

	beforeEach(() => {
		transaction = new ConfirmedTransactionData();

		commonData = {
			blockHash: "test_block_hash",
			confirmations: 10,
			data: "0x1234567890abcdef",
			from: "sender_address",
			gas: 21000,
			gasPrice: 10000000,
			hash: "test_hash",
			nonce: 1,
			receipt: { status: 1 },
			senderPublicKey: "somePublicKey",
			timestamp: new Date().getTime(),
			to: "recipient_address",
			value: 100000000,
		};
	});

	it("should return voteCombination type when isVoteCombination is true", () => {
		const mockTransaction = new ConfirmedTransactionData();
		mockTransaction.isVoteCombination = () => true;
		mockTransaction.configure(commonData);

		expect(mockTransaction.type()).toBe("voteCombination");
	});

	it("should return transfer type when isTransfer is true", () => {
		const mockTransaction = new ConfirmedTransactionData();
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

	it("should be instantiated and configured", () => {
		expect(transaction.configure(commonData)).toBeInstanceOf(ConfirmedTransactionData);
		expect(transaction.raw()).toEqual(commonData);
	});

	it("should set decimals correctly", () => {
		expect(transaction.withDecimals(8)).toBeInstanceOf(ConfirmedTransactionData);
		expect(transaction.withDecimals("8")).toBeInstanceOf(ConfirmedTransactionData);
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
		expect(object.confirmations).toBeInstanceOf(BigNumber);
		expect(object.fee).toBeInstanceOf(BigNumber);
		expect(object.timestamp).toBeInstanceOf(DateTime);
		expect(object.value).toBeInstanceOf(BigNumber);
		expect(object.hash).toBe("test_hash");
		expect(object.from).toBe("sender_address");
		expect(object.to).toBe("recipient_address");
	});

	it("#toJSON", () => {
		transaction.configure(commonData);
		const json = transaction.toJSON();
		expect(json.confirmations).toBe("10");
		expect(json.from).toBe("sender_address");
		expect(json.to).toBe("recipient_address");
	});

	it("#toHuman", () => {
		transaction.configure(commonData);
		const human = transaction.toHuman();
		expect(human.confirmations).toBe("10");
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

	it("#confirmations", () => {
		transaction.configure(commonData);
		expect(transaction.confirmations()).toEqual(new BigNumber(10));
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

	it("should return sum of payments for multi-payment value", () => {
		transaction.configure({ ...commonData, data: "0x1234567890abcdef" });
		expect(transaction.value()).toEqual(new BigNumber(300));
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

	it("should throw NotImplemented for publicKeys", () => {
		expect(() => transaction.publicKeys()).toThrow(Exceptions.NotImplemented);
	});

	it("should throw NotImplemented for min", () => {
		expect(() => transaction.min()).toThrow(Exceptions.NotImplemented);
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

	it("#isSuccess", () => {
		transaction.configure(commonData);
		expect(transaction.isSuccess()).toBe(true);
		transaction.configure({ ...commonData, receipt: { status: 0 } });
		expect(transaction.isSuccess()).toBe(false);
	});

	it("#isConfirmed", () => {
		transaction.configure({ ...commonData, confirmations: 1 });
		expect(transaction.isConfirmed()).toBe(true);
		transaction.configure({ ...commonData, confirmations: 0 });
		expect(transaction.isConfirmed()).toBe(false);
	});
});
