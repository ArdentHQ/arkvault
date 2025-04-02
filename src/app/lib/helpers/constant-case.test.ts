import { constantCase } from "./constant-case";

describe("constantCase", () => {
	it("should turn any string into constant case", () => {
		expect(constantCase("string")).toBe("STRING");
		expect(constantCase("camelCase")).toBe("CAMEL_CASE");
		expect(constantCase("param-case")).toBe("PARAM_CASE");
		expect(constantCase("PascalCase")).toBe("PASCAL_CASE");
		expect(constantCase("UPPER_CASE")).toBe("UPPER_CASE");
		expect(constantCase("snake_case")).toBe("SNAKE_CASE");
		expect(constantCase("sentence case")).toBe("SENTENCE_CASE");
		expect(constantCase("Title Case")).toBe("TITLE_CASE");
		expect(constantCase("dot.case")).toBe("DOT_CASE");
	});
});
