import { describe, expect, it } from "vitest";

import { kebabCase } from "./kebab-case";

describe("kebabCase", () => {
	it("should turn any string into kebab case", () => {
		expect(kebabCase("string")).toBe("string");
		expect(kebabCase("camelCase")).toBe("camel-case");
		expect(kebabCase("param-case")).toBe("param-case");
		expect(kebabCase("PascalCase")).toBe("pascal-case");
		expect(kebabCase("UPPER_CASE")).toBe("upper-case");
		expect(kebabCase("snake_case")).toBe("snake-case");
		expect(kebabCase("sentence case")).toBe("sentence-case");
		expect(kebabCase("Title Case")).toBe("title-case");
		expect(kebabCase("dot.case")).toBe("dot-case");
	});
});
