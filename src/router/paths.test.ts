import { ProfilePaths } from "./paths";

describe("paths", () => {
	it("has paths", () => {
		expect(Object.values(ProfilePaths)).toHaveLength(25);
	});
});
