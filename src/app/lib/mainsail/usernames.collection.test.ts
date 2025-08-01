import { describe, it, expect } from "vitest";
import { UsernameDataCollection } from "./usernames.collection";

// Mock UsernameData with minimal interface
const createUsername = (overrides = {}) => ({
	address: () => "address1",
	username: () => "user1",
	...overrides,
});

describe("UsernameDataCollection", () => {
	const u1 = createUsername();
	const u2 = createUsername({ address: () => "address2", username: () => "user2" });

	it("items should return all usernames", () => {
		const collection = new UsernameDataCollection([u1, u2]);
		expect(collection.items()).toEqual([u1, u2]);
	});

	it("findByAddress should return the correct username", () => {
		const collection = new UsernameDataCollection([u1, u2]);
		expect(collection.findByAddress("address1")).toBe(u1);
		expect(collection.findByAddress("address2")).toBe(u2);
		expect(collection.findByAddress("notfound")).toBeUndefined();
	});

	it("findByUsername should return the correct username", () => {
		const collection = new UsernameDataCollection([u1, u2]);
		expect(collection.findByUsername("user1")).toBe(u1);
		expect(collection.findByUsername("user2")).toBe(u2);
		expect(collection.findByUsername("notfound")).toBeUndefined();
	});

	it("isEmpty should return true for empty collection", () => {
		const collection = new UsernameDataCollection([]);
		expect(collection.isEmpty()).toBe(true);
	});

	it("isEmpty should return false for non-empty collection", () => {
		const collection = new UsernameDataCollection([u1]);
		expect(collection.isEmpty()).toBe(false);
	});

	it("isNotEmpty should return true for non-empty collection", () => {
		const collection = new UsernameDataCollection([u1]);
		expect(collection.isNotEmpty()).toBe(true);
	});

	it("isNotEmpty should return false for empty collection", () => {
		const collection = new UsernameDataCollection([]);
		expect(collection.isNotEmpty()).toBe(false);
	});
});
