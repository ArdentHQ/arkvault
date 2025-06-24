import { describe, expect, it } from "vitest";

import { AttributeBag } from "./attribute-bag";

interface TestAttributes {
	key?: string;
	key1?: string;
	key2?: string;
	key3?: string;
	nullValue?: null;
	definedValue?: string;
	undefinedValue?: undefined;
	missing?: string;
}

describe("AttributeBag", () => {
	it("should construct with initial attributes", () => {
		const bag = new AttributeBag<TestAttributes>({ key: "value" });
		expect(bag.all()).toEqual({ key: "value" });
	});

	it("should get all attributes", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		expect(bag.all()).toEqual({ key: "value" });
	});

	it("should get an attribute", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		expect(bag.get("key")).toBe("value");
	});

	it("should get an attribute with a default value", () => {
		const bag = new AttributeBag<TestAttributes>();
		expect(bag.get("key", "default")).toBe("default");
	});

	it("should set an attribute", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		expect(bag.get("key")).toBe("value");
	});

	it("should set many attributes", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.setMany({ key1: "value1", key2: "value2" });
		expect(bag.all()).toEqual({ key1: "value1", key2: "value2" });
	});

	it("should check if an attribute exists", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		expect(bag.has("key")).toBe(true);
		expect(bag.has("missing")).toBe(false);
	});

	it("should check if an attribute exists and is not null or undefined", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("nullValue", null);
		bag.set("definedValue", "value");
		bag.set("undefinedValue", undefined);

		expect(bag.hasStrict("definedValue")).toBe(true);
		expect(bag.hasStrict("nullValue")).toBe(true); // get returns null, which is not undefined
		expect(bag.hasStrict("undefinedValue")).toBe(false);
		expect(bag.hasStrict("missing")).toBe(false);
	});

	it("should check if an attribute is missing", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		expect(bag.missing("key")).toBe(false);
		expect(bag.missing("missing")).toBe(true);
	});

	it("should forget an attribute", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		bag.forget("key");
		expect(bag.has("key")).toBe(false);
	});

	it("should flush all attributes", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.set("key", "value");
		bag.flush();
		expect(bag.all()).toEqual({});
	});

	it("should get only the specified attributes", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.setMany({ key1: "value1", key2: "value2", key3: "value3" });
		expect(bag.only(["key1", "key2"])).toEqual({
			key1: "value1",
			key2: "value2",
		});
	});

	it("should exclude the specified attributes", () => {
		const bag = new AttributeBag<TestAttributes>();
		bag.setMany({ key1: "value1", key2: "value2", key3: "value3" });
		expect(bag.except(["key1", "key2"])).toEqual({ key3: "value3" });
	});
});
