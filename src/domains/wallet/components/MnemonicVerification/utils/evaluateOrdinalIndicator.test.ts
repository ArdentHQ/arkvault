import { getOrdinalIndicator } from "./evaluateOrdinalIndicator";

describe("Ordinal Indicator evaluation", () => {
	it("should return the right ordinal indicator", () => {
		expect(getOrdinalIndicator(1)).toBe("st");
		expect(getOrdinalIndicator(2)).toBe("nd");
		expect(getOrdinalIndicator(3)).toBe("rd");
		expect(getOrdinalIndicator(4)).toBe("th");
		expect(getOrdinalIndicator(5)).toBe("th");
		expect(getOrdinalIndicator(6)).toBe("th");
		expect(getOrdinalIndicator(7)).toBe("th");
		expect(getOrdinalIndicator(8)).toBe("th");
		expect(getOrdinalIndicator(9)).toBe("th");
		expect(getOrdinalIndicator(10)).toBe("th");
	});
});
