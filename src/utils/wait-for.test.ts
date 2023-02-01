/* eslint-disable @typescript-eslint/require-await */
import { waitFor } from "./wait-for";

describe("Wait for", () => {
	it("pause for the amount of ms provided", async () => {
		const setTimeoutSpy = vi.spyOn(global, "setTimeout").mockImplementation((function_) => function_());

		await waitFor(1234);

		expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 1234);
	});
});
