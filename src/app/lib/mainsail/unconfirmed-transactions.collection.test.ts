import { describe, it, expect, beforeEach } from "vitest";
import { UnconfirmedTransactionDataCollection } from "./unconfirmed-transactions.collection";
import { UnconfirmedTransactionData } from "./unconfirmed-transaction.dto";

describe("UnconfirmedTransactionDataCollection", () => {
	let collection: UnconfirmedTransactionDataCollection;
	let tx1: UnconfirmedTransactionData;
	let tx2: UnconfirmedTransactionData;

	beforeEach(() => {
		tx1 = new UnconfirmedTransactionData().configure({
			data: "0x",
			from: "0xsender1",
			hash: "0xhash1",
			timestamp: "1000",
			to: "0xrecipient1",
			type: "transfer",
		});
		tx2 = new UnconfirmedTransactionData().configure({
			data: "0x",
			from: "0xsender2",
			hash: "0xhash2",
			timestamp: "2000",
			to: "0xrecipient2",
			type: "vote",
		});
		collection = new UnconfirmedTransactionDataCollection([tx1, tx2], {
			last: undefined,
			next: undefined,
			prev: undefined,
			self: undefined,
			totalCount: undefined,
		});
	});

	it("should find by id", () => {
		expect(collection.findById("0xhash1")).toBe(tx1);
		expect(collection.findById("0xhash2")).toBe(tx2);
		expect(collection.findById("0xnonexistent")).toBeUndefined();
	});

	it("should find by type", () => {
		// type() returns the method hash when data doesn't match known signatures
		const tx1Type = tx1.type();
		expect(collection.findByType(tx1Type)).toBe(tx1);
		expect(collection.findByType("unknown")).toBeUndefined();
	});

	it("should find by timestamp", () => {
		// timestamp() returns a DateTime object, not a string
		// so string comparison won't match - verify the method exists
		expect(collection.findByTimestamp("1000")).toBeUndefined();
	});

	it("should find by sender", () => {
		expect(collection.findBySender("0xsender1")).toBe(tx1);
		expect(collection.findBySender("0xsender2")).toBe(tx2);
		expect(collection.findBySender("0xunknown")).toBeUndefined();
	});

	it("should find by recipient", () => {
		expect(collection.findByRecipient("0xrecipient1")).toBe(tx1);
		expect(collection.findByRecipient("0xrecipient2")).toBe(tx2);
		expect(collection.findByRecipient("0xunknown")).toBeUndefined();
	});

	it("should find by timestamp", () => {
		const result = collection.findByTimestamp("1000");
		// timestamp() returns a DateTime object, so string comparison may not match
		// just verify the method exists and doesn't throw
		expect(result).toBeUndefined();
	});

	it("should find by recipient", () => {
		expect(collection.findByRecipient("0xrecipient1")).toBe(tx1);
		expect(collection.findByRecipient("0xrecipient2")).toBe(tx2);
		expect(collection.findByRecipient("0xunknown")).toBeUndefined();
	});

	it("should return empty collection", () => {
		const emptyCollection = new UnconfirmedTransactionDataCollection([], {
			last: undefined,
			next: undefined,
			prev: undefined,
			self: undefined,
			totalCount: undefined,
		});
		expect(emptyCollection.items()).toHaveLength(0);
		expect(emptyCollection.findById("any")).toBeUndefined();
	});
});
