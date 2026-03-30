import { describe, expect, it } from "vitest";
import { DataRepository } from "./data.repository";

describe("DataRepository", () => {
	it("should return all", () => {
		const repo = new DataRepository();
		expect(repo.all()).toEqual({});
	});

	it("should return first", () => {
		const repo = new DataRepository();
		repo.set("1", { id: "1" });

		expect(repo.first()).toEqual({ id: "1" });
	});

	it("should return undefined for first when empty", () => {
		const repo = new DataRepository();
		expect(repo.first()).toBeUndefined();
	});

	it("should return last", () => {
		const repo = new DataRepository();
		repo.set("1", { id: "1" });
		repo.set("2", { id: "2" });

		expect(repo.last()).toEqual({ id: "2" });
	});

	it("should return undefined for last when empty", () => {
		const repo = new DataRepository();
		expect(repo.last()).toBeUndefined();
	});

	it("should return keys", () => {
		const repo = new DataRepository();
		repo.set("1", {});
		repo.set("2", {});

		expect(repo.keys()).toEqual(["1", "2"]);
	});

	it("should return values", () => {
		const repo = new DataRepository();
		repo.set("1", { id: "1" });
		repo.set("2", { id: "2" });

		expect(repo.values()).toHaveLength(2);
	});

	it("should get value", () => {
		const repo = new DataRepository();
		repo.set("key", "value");

		expect(repo.get("key")).toBe("value");
	});

	it("should return default value", () => {
		const repo = new DataRepository();
		expect(repo.get("missing", "default")).toBe("default");
	});

	it("should set value", () => {
		const repo = new DataRepository();
		repo.set("key", "value");

		expect(repo.get("key")).toBe("value");
	});

	it("should fill from object", () => {
		const repo = new DataRepository();
		repo.fill({ a: 1, b: 2 });

		expect(repo.get("a")).toBe(1);
		expect(repo.get("b")).toBe(2);
	});

	it("should check has", () => {
		const repo = new DataRepository();
		repo.set("key", "value");

		expect(repo.has("key")).toBe(true);
		expect(repo.has("missing")).toBe(false);
	});

	it("should check missing", () => {
		const repo = new DataRepository();
		repo.set("key", "value");

		expect(repo.missing("key")).toBe(false);
		expect(repo.missing("missing")).toBe(true);
	});

	it("should forget value", () => {
		const repo = new DataRepository();
		repo.set("key", "value");
		repo.forget("key");

		expect(repo.has("key")).toBe(false);
	});

	it("should forget index from array", () => {
		const repo = new DataRepository();
		repo.set("arr", ["a", "b", "c"]);
		repo.forgetIndex("arr", 1);

		expect(repo.get("arr")).toEqual(["a", "c"]);
	});

	it("should not forget index when value is undefined", () => {
		const repo = new DataRepository();
		repo.forgetIndex("missing", 0);

		expect(repo.get("missing")).toBeUndefined();
	});

	it("should flush", () => {
		const repo = new DataRepository();
		repo.set("key", "value");
		repo.flush();

		expect(repo.keys()).toEqual([]);
	});

	it("should return count", () => {
		const repo = new DataRepository();
		repo.set("1", {});
		repo.set("2", {});

		expect(repo.count()).toBe(2);
	});

	it("should snapshot and restore", () => {
		const repo = new DataRepository();
		repo.set("key", "value");
		repo.snapshot();

		repo.set("key", "new value");
		repo.restore();

		expect(repo.get("key")).toBe("value");
	});

	it("should throw when restoring without snapshot", () => {
		const repo = new DataRepository();
		expect(() => repo.restore()).toThrow("There is no snapshot to restore.");
	});

	it("should return JSON", () => {
		const repo = new DataRepository();
		repo.set("key", "value");

		expect(repo.toJSON()).toBe('{"key":"value"}');
	});
});
