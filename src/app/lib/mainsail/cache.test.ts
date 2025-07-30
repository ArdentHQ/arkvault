import { describe, it, expect, beforeAll, vi } from "vitest";
import { Cache } from "./cache";

let subject: Cache;

describe("Cache", () => {
	beforeAll(() => {
		subject = new Cache(10);
	});

	it("should remember a value if it is a string", async () => {
		subject.flush();

		await expect(subject.remember("cacheKey", "value")).resolves.toBe("value");
	});

	it("should remember a value if it is a function", async () => {
		subject.flush();

		const valueFunction = vi.fn(() => "value");

		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");

		expect(valueFunction).toHaveBeenCalledTimes(1);
	});

	it("should forget a cached value", async () => {
		subject.flush();

		// Cache a value
		await expect(subject.remember("testKey", "testValue")).resolves.toBe("testValue");

		// Verify it's cached (should return same value without calling function again)
		const valueFunction = vi.fn(() => "newValue");
		await expect(subject.remember("testKey", valueFunction)).resolves.toBe("testValue");
		expect(valueFunction).not.toHaveBeenCalled();

		// Forget the cached value
		subject.forget("testKey");

		// Now it should call the function since cache was cleared
		await expect(subject.remember("testKey", valueFunction)).resolves.toBe("newValue");
		expect(valueFunction).toHaveBeenCalledTimes(1);
	});

	it("should handle forgetting a non-existent key", () => {
		subject.flush();

		// Should not throw when forgetting a key that doesn't exist
		expect(() => subject.forget("nonExistentKey")).not.toThrow();
	});
});
