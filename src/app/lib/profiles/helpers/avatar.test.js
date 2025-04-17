import { describe } from "@ardenthq/sdk-test";

import { Avatar } from "./avatar";

describe("Helpers", ({ assert, it, nock, loader }) => {
	it("should generate an avatar", () => {
		assert.snapshot("helpers-avatar", Avatar.make("Hello World"));
	});
});
