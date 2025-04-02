import { describe } from "@ardenthq/sdk-test";

import { kebabCase } from "./kebab-case";

describe("kebabCase", async ({ assert, it, nock, loader }) => {
	it("should turn any string into kebab case", () => {
		assert.is(kebabCase("string"), "string");
		assert.is(kebabCase("camelCase"), "camel-case");
		assert.is(kebabCase("param-case"), "param-case");
		assert.is(kebabCase("PascalCase"), "pascal-case");
		assert.is(kebabCase("UPPER_CASE"), "upper-case");
		assert.is(kebabCase("snake_case"), "snake-case");
		assert.is(kebabCase("sentence case"), "sentence-case");
		assert.is(kebabCase("Title Case"), "title-case");
		assert.is(kebabCase("dot.case"), "dot-case");
	});
});
