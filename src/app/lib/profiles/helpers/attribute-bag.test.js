import { AttributeBag } from "./attribute-bag";

describe("AttributeBag", () => {
	let subject;
	const values = { a: "a", b: "b", c: "c" };

	beforeEach(() => (subject = new AttributeBag()));

	it("#all", () => {
		subject.setMany(values);

		expect(subject.all()).toEqual(values);
	});

	it("#get", () => {
		expect(subject.get("a", "defaultValue")).toBe("defaultValue");

		subject.set("a", "a");

		expect(subject.get("a")).toBe("a");
	});

	it("#set", () => {
		subject.set("a", "a");

		expect(subject.has("a")).toBe(true);
	});

	it("#has", () => {
		expect(subject.has("a")).toBe(false);

		subject.set("a", "a");

		expect(subject.has("a")).toBe(true);
	});

	it("#hasStrict", () => {
		subject.set("a", undefined);

		expect(subject.hasStrict("a")).toBe(false);

		subject.set("a", "a");

		expect(subject.hasStrict("a")).toBe(true);
	});

	it("#missing", () => {
		expect(subject.missing("a")).toBe(true);

		subject.set("a", "a");

		expect(subject.missing("a")).toBe(false);
	});

	it("#forget", () => {
		subject.set("a", "a");

		expect(subject.has("a")).toBe(true);

		subject.forget("a");

		expect(subject.missing("a")).toBe(true);
	});

	it("#flush", () => {
		subject.set("a", "a");

		expect(subject.has("a")).toBe(true);

		subject.flush();

		expect(subject.missing("a")).toBe(true);
	});

	it("#only", () => {
		subject.setMany(values);

		expect(subject.only(["a", "b"])).toEqual({ a: "a", b: "b" });
	});

	it("#except", () => {
		subject.setMany(values);

		expect(subject.except(["a", "b"])).toEqual({ c: "c" });
	});
});
