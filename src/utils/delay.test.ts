import { delay } from "./delay";

describe("delay", () => {
	it("should be setTimeout", () => {
		expect(delay).toBe(setTimeout);
	});
});
