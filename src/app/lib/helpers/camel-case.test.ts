import { camelCase } from "./camel-case";

describe("camelCase", () => {
	it("should turn any string into camel case", () => {
		expect(camelCase("string")).toBe("string");
		expect(camelCase("camelCase")).toBe("camelCase");
		expect(camelCase("param-case")).toBe("paramCase");
		expect(camelCase("PascalCase")).toBe("pascalCase");
		expect(camelCase("UPPER_CASE")).toBe("upperCase");
		expect(camelCase("snake_case")).toBe("snakeCase");
		expect(camelCase("sentence case")).toBe("sentenceCase");
		expect(camelCase("Title Case")).toBe("titleCase");
		expect(camelCase("dot.case")).toBe("dotCase");
	});
});
