import { describe, it, expect } from "vitest";
import { pqueue, pqueueSettled } from "./queue.js";

const success = async (result: any, delay = 1) => new Promise((resolve) => setTimeout(() => resolve(result), delay));

const failure = async (result: any, delay = 1) => new Promise((_, reject) => setTimeout(() => reject(result), delay));

describe("pqueue", () => {
	it("should resolve all promises", async () => {
		const promises = [() => success("first"), () => success("second"), () => success("third")];

		const results = await pqueue(promises);
		expect(results).toEqual(["first", "second", "third"]);
	});

	it("should reject if a promise fails", async () => {
		const promises = [() => success("first"), () => failure("second"), () => success("third")];

		await expect(pqueue(promises)).rejects.toBe("second");
	});
});

describe("pqueueSettled", () => {
	it("should resolve all promises", async () => {
		const promises = [() => success("first"), () => success("second"), () => success("third")];

		const results = await pqueueSettled(promises);

		expect(results).toEqual([
			{ status: "fulfilled", value: "first" },
			{ status: "fulfilled", value: "second" },
			{ status: "fulfilled", value: "third" },
		]);
	});

	it("should settle all promises", async () => {
		const promises = [() => success("first"), () => failure("second"), () => success("third")];

		const results = await pqueueSettled(promises);

		expect(results).toEqual([
			{ status: "fulfilled", value: "first" },
			{ reason: "second", status: "rejected" },
			{ status: "fulfilled", value: "third" },
		]);
	});
});
