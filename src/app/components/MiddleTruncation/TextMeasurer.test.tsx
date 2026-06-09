import { TextMeasurer } from "./MiddleTruncator";

describe("TextMeasurer.measureText", () => {
	it("returns the measured width when getContext succeeds", () => {
		const mockContext = {
			font: "",
			measureText: vi.fn((text: string) => ({ width: text.length * 10 })),
		};

		const spy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			if (tag === "canvas") {
				return { getContext: () => mockContext };
			}
			return originalCreateElement(tag);
		});

		const width = TextMeasurer.measureText("Hello", "16px sans-serif");
		expect(width).toBe(50);
		expect(mockContext.font).toBe("16px sans-serif");

		spy.mockRestore();
	});

	it("returns 0 when getContext returns null", () => {
		const spy = vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
			if (tag === "canvas") {
				return { getContext: () => null };
			}
			return originalCreateElement(tag);
		});

		const width = TextMeasurer.measureText("Hello", "16px sans-serif");
		expect(width).toBe(0);

		spy.mockRestore();
	});
});

const originalCreateElement = document.createElement.bind(document);
