import { beforeAll, afterAll, vi } from "vitest";

export function actWarningsAsErrors() {
	const originalConsoleError = console.error;

	beforeAll(() => {
		vi.spyOn(console, "error").mockImplementation((...arguments_) => {
			if (typeof arguments_[0] === "string" && arguments_[0].includes("not wrapped in act")) {
				throw new Error(`React act warning detected:\n\n${arguments_.join(" ")}`);
			}

			// Other warning, ignore.
			originalConsoleError(...arguments_);
		});
	});

	afterAll(() => {
		console.error = originalConsoleError;
	});
}
