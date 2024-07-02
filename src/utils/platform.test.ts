import { browser } from "./platform";

describe("platform", () => {
	it.each([true, false])("determines if supports overflow overaly", (result) => {
		const cssSpy = vi.spyOn(CSS, "supports").mockReturnValue(result);

		expect(browser.supportsOverflowOverlay()).toBe(result);

		cssSpy.mockRestore();
	});
});
