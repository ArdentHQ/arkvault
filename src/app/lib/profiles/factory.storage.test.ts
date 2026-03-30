import { describe, it, expect } from "vitest";
import { StorageFactory } from "./factory.storage";
import { LocalStorage } from "./local.storage";
import { MemoryStorage } from "./memory.storage";
import { NullStorage } from "./null.storage";

describe("StorageFactory", () => {
	it("should create LocalStorage for indexeddb", () => {
		const storage = StorageFactory.make("indexeddb");
		expect(storage).toBeInstanceOf(LocalStorage);
	});

	it("should create LocalStorage for localstorage", () => {
		const storage = StorageFactory.make("localstorage");
		expect(storage).toBeInstanceOf(LocalStorage);
	});

	it("should create LocalStorage for websql", () => {
		const storage = StorageFactory.make("websql");
		expect(storage).toBeInstanceOf(LocalStorage);
	});

	it("should create MemoryStorage for memory", () => {
		const storage = StorageFactory.make("memory");
		expect(storage).toBeInstanceOf(MemoryStorage);
	});

	it("should create NullStorage for null", () => {
		const storage = StorageFactory.make("null");
		expect(storage).toBeInstanceOf(NullStorage);
	});
});
