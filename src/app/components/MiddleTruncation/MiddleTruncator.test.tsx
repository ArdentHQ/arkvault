import { TextMeasurer } from "./MiddleTruncator";
import { Utils } from "./MiddleTruncator";
import { MiddleTruncator } from "./MiddleTruncator";

// Mock measureText to return predictable widths for testing truncation logic
const originalMeasureText = TextMeasurer.measureText;
const mockWidths: Record<string, number> = {};

const FONT = "16px sans-serif";

function mockMeasureText(text: string, font: string): number {
	const key = `${text}|||${font}`;
	if (key in mockWidths) {
		return mockWidths[key];
	}
	if (!text) {
		return 0;
	}
	return text.length * 10 + 4;
}

beforeEach(() => {
	TextMeasurer.measureText = mockMeasureText;
	for (const k of Object.keys(mockWidths)) {
		delete mockWidths[k];
	}
});

afterEach(() => {
	TextMeasurer.measureText = originalMeasureText;
});

describe("MiddleTruncator", () => {
	it("returns the original text when it fits", () => {
		const text = "Short";
		const measuredWidth = TextMeasurer.measureText(text, FONT);
		expect(MiddleTruncator.truncate(text, measuredWidth + 10, FONT)).toEqual(text);
	});

	it("truncates when text does not fit", () => {
		const text = "abcdefghijklmnopqrstuvwxyz";
		const measuredWidth = TextMeasurer.measureText(text, FONT);
		const constrainedWidth = measuredWidth - 50;

		const result = MiddleTruncator.truncate(text, constrainedWidth, FONT);
		expect(result).not.toEqual(text);
	});

	it("handles zero tail length via Utils.buildTruncatedText", () => {
		expect(Utils.buildTruncatedText("HelloWorld", 5, 0)).toEqual(`Hello${MiddleTruncator.ELLIPSIS}`);
	});

	it("handles zero total length via Utils.buildTruncatedText", () => {
		expect(Utils.buildTruncatedText("HelloWorld", 0, 0)).toEqual(MiddleTruncator.ELLIPSIS);
	});
});
