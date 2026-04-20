import { describe, it, beforeEach, expect } from "vitest";
import { LocalStorage } from "./local.storage";

describe("LocalStorage", () => {
	let storage: LocalStorage;

	beforeEach(async () => {
		storage = new LocalStorage("localstorage");
		await storage.flush();
	});

	it("#set", async () => {
		await storage.set("foo", "bar");
		expect(await storage.get("foo")).toBe("bar");
	});

	it("#get", async () => {
		await storage.set("foo", "bar");
		expect(await storage.get("foo")).toBe("bar");
		expect(await storage.get("missing")).toBeNull();
	});

	it("#all", async () => {
		await storage.set("a", 1);
		await storage.set("b", 2);
		const all = await storage.all();
		expect(all).toHaveProperty("a", 1);
		expect(all).toHaveProperty("b", 2);
	});

	it("#has", async () => {
		await storage.set("foo", "bar");
		expect(await storage.has("foo")).toBe(true);
		expect(await storage.has("missing")).toBe(false);
	});

	it("#forget", async () => {
		await storage.set("x", 1);
		await storage.forget("x");
		expect(await storage.has("x")).toBe(false);
	});

	it("#count", async () => {
		await storage.set("x", 1);
		expect(await storage.count()).toBe(1);
	});

	it("#flush", async () => {
		await storage.set("y", 2);
		await storage.flush();
		expect(await storage.count()).toBe(0);
	});

	it("#snapshot", async () => {
		await storage.set("s", "v");
		await storage.snapshot();
		expect(await storage.get("s")).toBe("v");
	});

	it("#restore", async () => {
		await storage.set("s", "v");
		await storage.snapshot();
		await storage.flush();
		await storage.restore();
		expect(await storage.get("s")).toBe("v");
	});

	it("#restore throws without snapshot", async () => {
		const fresh = new LocalStorage("localstorage");
		await expect(fresh.restore()).rejects.toThrow("There is no snapshot");
	});
});
