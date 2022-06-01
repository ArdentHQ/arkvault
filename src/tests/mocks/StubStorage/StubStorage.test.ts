import { StubStorage } from "./StubStorage";

describe("StubStorage", () => {
	const stubStorage = new StubStorage();

	beforeEach(function () {
		stubStorage.flush();
	});

	it("should return current storage", async () => {
		await expect(stubStorage.all()).resolves.toStrictEqual({});
	});

	it("should return set and get an entry into storage", async () => {
		await stubStorage.set("item", "bleh");

		await expect(stubStorage.get("item")).resolves.toBe("bleh");
	});

	it("should check if the storage has a key", async () => {
		await stubStorage.set("item", "bleh");

		await expect(stubStorage.has("item")).resolves.toBe(true);
	});

	it("should forget a key", async () => {
		await stubStorage.set("item", "bleh");
		await stubStorage.forget("item");

		await expect(stubStorage.has("item")).resolves.toBe(false);
	});

	it("should flush the storage", async () => {
		await stubStorage.set("item", "bleh");
		await stubStorage.flush();

		await expect(stubStorage.all()).resolves.toStrictEqual({});
	});

	it("should return count", async () => {
		await expect(stubStorage.count()).resolves.toBe(0);
	});

	it("should restore", async () => {
		await expect(stubStorage.restore()).resolves.toBeUndefined();
	});

	it("should snapshot", async () => {
		await expect(stubStorage.snapshot()).resolves.toBeUndefined();
	});
});
