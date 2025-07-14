import { describe, expect, it } from "vitest";
import { ExtendedConfirmedTransactionDataCollection } from "./transaction.collection";
import { TransactionFixture } from "@/tests/fixtures/transactions";

const mockTransaction1 = {
	...TransactionFixture,
	from: () => "sender1",
	hash: () => "hash1",
	timestamp: () => "timestamp1",
	to: () => "recipient1",
	type: () => "type1",
};

const mockTransaction2 = {
	...TransactionFixture,
	from: () => "sender2",
	hash: () => "hash2",
	timestamp: () => "timestamp2",
	to: () => "recipient2",
	type: () => "type2",
};

const transactions = [mockTransaction1, mockTransaction2];

describe("ExtendedConfirmedTransactionDataCollection", () => {
	it("should find a transaction by its ID", () => {
		const subject = new ExtendedConfirmedTransactionDataCollection(transactions, {});
		expect(subject.findById("hash1")).toEqual(mockTransaction1);
		expect(subject.findById("non-existent-hash")).toBeUndefined();
	});

	it("should find a transaction by its type", () => {
		const subject = new ExtendedConfirmedTransactionDataCollection(transactions, {});
		expect(subject.findByType("type1")).toEqual(mockTransaction1);
		expect(subject.findByType("non-existent-type")).toBeUndefined();
	});

	it("should find a transaction by its timestamp", () => {
		const subject = new ExtendedConfirmedTransactionDataCollection(transactions, {});
		expect(subject.findByTimestamp("timestamp1")).toEqual(mockTransaction1);
		expect(subject.findByTimestamp("non-existent-timestamp")).toBeUndefined();
	});

	it("should find a transaction by its sender", () => {
		const subject = new ExtendedConfirmedTransactionDataCollection(transactions, {});
		expect(subject.findBySender("sender1")).toEqual(mockTransaction1);
		expect(subject.findBySender("non-existent-sender")).toBeUndefined();
	});

	it("should find a transaction by its recipient", () => {
		const subject = new ExtendedConfirmedTransactionDataCollection(transactions, {});
		expect(subject.findByRecipient("recipient1")).toEqual(mockTransaction1);
		expect(subject.findByRecipient("non-existent-recipient")).toBeUndefined();
	});
});
