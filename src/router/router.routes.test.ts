import { routes } from "./router.routes";

describe("Route routes", () => {
	it("should have routes", () => {
		expect(routes).toHaveLength(29);
	});
});
