import { beforeEach, describe, it, expect } from "vitest";
import { NullStorage } from "./null.storage";

describe("NullStorage", () => {
	let storage: NullStorage;

	beforeEach(() => {
		storage = new NullStorage();
	});

	it("#all", async () => {
		const result = await storage.all();
		expect(result).toEqual({});
	});

	it("#get", async () => {
		const result = await storage.get("foo");
		expect(result).toBeUndefined();
	});

	it("#set", async () => {
		await expect(storage.set("foo", "bar")).resolves.toBeUndefined();
	});

	it("#has", async () => {
		const result = await storage.has("foo");
		expect(result).toBe(false);
	});

	it("#forget", async () => {
		await expect(storage.forget("foo")).resolves.toBeUndefined();
	});

	it("#flush", async () => {
		await expect(storage.flush()).resolves.toBeUndefined();
	});

	it("#count", async () => {
		const result = await storage.count();
		expect(result).toBe(0);
	});

	it("#snapshot", async () => {
		await expect(storage.snapshot()).resolves.toBeUndefined();
	});

	it("#restore", async () => {
		await expect(storage.restore()).resolves.toBeUndefined();
	});
});
