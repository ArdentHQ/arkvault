import { describe } from "@ardenthq/sdk-test";

import { startCase } from "./start-case";

describe("startCase", async ({ assert, it, nock, loader }) => {
	it("should turn any string into start case", () => {
		assert.is(startCase("string"), "String");
		assert.is(startCase("camelCase"), "Camel Case");
		assert.is(startCase("param-case"), "Param Case");
		assert.is(startCase("PascalCase"), "Pascal Case");
		assert.is(startCase("UPPER_CASE"), "Upper Case");
		assert.is(startCase("snake_case"), "Snake Case");
		assert.is(startCase("sentence case"), "Sentence Case");
		assert.is(startCase("Title Case"), "Title Case");
		assert.is(startCase("dot.case"), "Dot Case");
	});
});
