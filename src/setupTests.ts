import "@testing-library/vi-dom/extend-expect";
import "mutationobserver-shim";

describe("setup", () => {
	beforeAll(() => {
		Object.defineProperty(window, "matchMedia", {
			value: vi.fn().mockImplementation((query) => ({
				// deprecated
				addEventListener: vi.fn(),

				addListener: vi.fn(),

				dispatchEvent: vi.fn(),

				matches: false,

				media: query,

				onchange: undefined,

				removeEventListener: vi.fn(),
				// deprecated
				removeListener: vi.fn(),
			})),
			writable: true,
		});
	});
});

global.fetch = require("vi-fetch-mock");
