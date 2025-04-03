import { Avatar } from "./avatar";

describe("Helpers", () => {
	it("should generate an avatar", () => {
		expect(Avatar.make("Hello World")).toMatchSnapshot();
	});
});
