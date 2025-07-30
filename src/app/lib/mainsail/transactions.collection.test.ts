import { describe, it, expect } from "vitest";
import { ConfirmedTransactionDataCollection } from "./transactions.collection";

// Mock ConfirmedTransactionData with minimal interface
const createTx = (overrides = {}) => ({
	from: () => "sender1",
	hash: () => "hash123",
	timestamp: () => "1234567890",
	to: () => "recipient1",
	type: () => "transfer",
	...overrides,
});

describe("ConfirmedTransactionDataCollection", () => {
	const tx1 = createTx();
	const tx2 = createTx({
		from: () => "sender2",
		hash: () => "hash456",
		timestamp: () => "9876543210",
		to: () => "recipient2",
		type: () => "vote",
	});
	const collection = new ConfirmedTransactionDataCollection([tx1, tx2]);

	it("findById should return the correct transaction", () => {
		expect(collection.findById("hash123")).toBe(tx1);
		expect(collection.findById("hash456")).toBe(tx2);
		expect(collection.findById("notfound")).toBeUndefined();
	});

	it("findByType should return the correct transaction", () => {
		expect(collection.findByType("transfer")).toBe(tx1);
		expect(collection.findByType("vote")).toBe(tx2);
		expect(collection.findByType("notfound")).toBeUndefined();
	});

	it("findByTimestamp should return the correct transaction", () => {
		expect(collection.findByTimestamp("1234567890")).toBe(tx1);
		expect(collection.findByTimestamp("9876543210")).toBe(tx2);
		expect(collection.findByTimestamp("notfound")).toBeUndefined();
	});

	it("findBySender should return the correct transaction", () => {
		expect(collection.findBySender("sender1")).toBe(tx1);
		expect(collection.findBySender("sender2")).toBe(tx2);
		expect(collection.findBySender("notfound")).toBeUndefined();
	});

	it("findByRecipient should return the correct transaction", () => {
		expect(collection.findByRecipient("recipient1")).toBe(tx1);
		expect(collection.findByRecipient("recipient2")).toBe(tx2);
		expect(collection.findByRecipient("notfound")).toBeUndefined();
	});
});
