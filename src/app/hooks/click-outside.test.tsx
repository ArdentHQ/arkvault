import userEvent from "@testing-library/user-event";

import { clickOutsideHandler } from "@/app/hooks/click-outside";

describe("ClickOutside Hook", () => {
	it("should not call callback if clicked on target element", () => {
		const element = document.body;
		const reference = { current: element };
		const callback = vi.fn();
		clickOutsideHandler(reference, callback);

		userEvent.click(element);

		expect(callback).not.toHaveBeenCalled();
	});

	it("should call callback if clicked outside target element", async () => {
		const div = document.createElement("div");
		const reference = { current: div };

		const callback = vi.fn();
		clickOutsideHandler(reference, callback);

		await userEvent.click(document.body);

		expect(callback).toHaveBeenCalledWith();
	});

	it("should cover the removeEvent", () => {
		const div = document.createElement("div");
		const reference = { current: div };
		const handler = clickOutsideHandler(reference, () => "test")();

		expect(handler).toBeUndefined();
	});
});
