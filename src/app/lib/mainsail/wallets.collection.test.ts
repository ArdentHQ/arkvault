import { describe, it, expect } from "vitest";
import { WalletDataCollection } from "./wallets.collection";

// Mock WalletData with minimal interface
const createWallet = (overrides = {}) => ({
	address: () => "address1",
	publicKey: () => "pubkey1",
	username: () => "user1",
	...overrides,
});

describe("WalletDataCollection", () => {
	const w1 = createWallet();
	const w2 = createWallet({ address: () => "address2", publicKey: () => "pubkey2", username: () => "user2" });

	it("findByAddress should return the correct wallet", () => {
		const collection = new WalletDataCollection([w1, w2]);
		expect(collection.findByAddress("address1")).toBe(w1);
		expect(collection.findByAddress("address2")).toBe(w2);
		expect(collection.findByAddress("notfound")).toBeUndefined();
	});

	it("findByPublicKey should return the correct wallet", () => {
		const collection = new WalletDataCollection([w1, w2]);
		expect(collection.findByPublicKey("pubkey1")).toBe(w1);
		expect(collection.findByPublicKey("pubkey2")).toBe(w2);
		expect(collection.findByPublicKey("notfound")).toBeUndefined();
	});

	it("findByUsername should return the correct wallet", () => {
		const collection = new WalletDataCollection([w1, w2]);
		expect(collection.findByUsername("user1")).toBe(w1);
		expect(collection.findByUsername("user2")).toBe(w2);
		expect(collection.findByUsername("notfound")).toBeUndefined();
	});
});
