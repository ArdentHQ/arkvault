import { describe } from "@ardenthq/sdk-test";

import { camelCase } from "./camel-case";

describe("camelCase", async ({ assert, it, nock, loader }) => {
	it("should turn any string into camel case", () => {
		assert.is(camelCase("string"), "string");
		assert.is(camelCase("camelCase"), "camelCase");
		assert.is(camelCase("param-case"), "paramCase");
		assert.is(camelCase("PascalCase"), "pascalCase");
		assert.is(camelCase("UPPER_CASE"), "upperCase");
		assert.is(camelCase("snake_case"), "snakeCase");
		assert.is(camelCase("sentence case"), "sentenceCase");
		assert.is(camelCase("Title Case"), "titleCase");
		assert.is(camelCase("dot.case"), "dotCase");
	});
});
