import { routes } from "./router.routes";

describe("Router routes", () => {
	it("should have routes", () => {
		expect(routes).toHaveLength(31);
	});
});
