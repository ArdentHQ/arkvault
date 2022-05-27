import { Cache } from "./Cache";

let subject: Cache;

describe("Cache", () => {
	beforeAll(() => (subject = new Cache(10)));

	it("should remember a value if it is a string", async () => {
		subject.flush();

		await expect(subject.remember("cacheKey", "value")).resolves.toBe("value");
	});

	it("should remember a value if it is a function", async () => {
		subject.flush();

		const valueFunction = jest.fn(() => "value");

		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");
		await expect(subject.remember("cacheKey", valueFunction)).resolves.toBe("value");

		expect(valueFunction).toHaveBeenCalledTimes(1);
	});
});
