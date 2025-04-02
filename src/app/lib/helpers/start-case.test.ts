import { describe, expect, it } from "vitest";

import { startCase } from "./start-case";

describe("startCase", () => {
	it("should turn any string into start case", () => {
		expect(startCase("string")).toBe("String");
		expect(startCase("camelCase")).toBe("Camel Case");
		expect(startCase("param-case")).toBe("Param Case");
		expect(startCase("PascalCase")).toBe("Pascal Case");
		expect(startCase("UPPER_CASE")).toBe("Upper Case");
		expect(startCase("snake_case")).toBe("Snake Case");
		expect(startCase("sentence case")).toBe("Sentence Case");
		expect(startCase("Title Case")).toBe("Title Case");
		expect(startCase("dot.case")).toBe("Dot Case");
	});
});
