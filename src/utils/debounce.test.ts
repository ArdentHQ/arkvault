import { debounceAsync } from "@/utils/debounce";
import { waitFor } from "@/utils/testing-library";

describe("debounce", () => {
	it("debounceAsync", async () => {
		const callback = vi.fn();

		const debouncedCallback = debounceAsync(callback, 10);
		debouncedCallback();

		await waitFor(() => expect(callback).toHaveBeenCalledWith());
	});
});
