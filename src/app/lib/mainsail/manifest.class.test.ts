import { describe, it, expect } from "vitest";
import { Manifest } from "./manifest.class";

describe("Manifest", () => {
	it("should return the manifest", () => {
		const manifestData = { key1: "value1", key2: 123 };
		const manifest = new Manifest(manifestData);

		expect(manifest.all()).toEqual(manifestData);
	});

	it("should get a value by name", () => {
		const manifestData = { key1: "value1", nested: { deep: "value2" } };
		const manifest = new Manifest(manifestData);

		expect(manifest.get<string>("key1")).toBe("value1");
	});

	it("should throw an error if the key does not exist", () => {
		const manifestData = { key1: "value1" };
		const manifest = new Manifest(manifestData);

		expect(() => manifest.get("nonExistentKey")).toThrow(
			"The [nonExistentKey] key does not exist in the manifest.",
		);
	});
});
