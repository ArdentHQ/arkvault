import { render, screen, renderHook } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { beforeunloadEventListener, useBeforeunload } from "./use-before-unload";

describe("useBeforeunload", () => {
	it("should return 'add' and 'remove' functions", () => {
		const {
			result: { current },
		} = renderHook(() => useBeforeunload());

		expect(typeof current.addBeforeunload).toBe("function");
		expect(typeof current.removeBeforeunload).toBe("function");
	});

	it("should `beforeunloadEventListener` be the event function", () => {
		const event = new Event("beforeunload", { cancelable: true });
		const result = beforeunloadEventListener(event);

		expect(result).toBe("");
	});

	it("should `beforeunloadEventListener` be the event function in Chrome", () => {
		const event = new Event("beforeunload", { cancelable: true });
		const eventSpy = vi.spyOn(event, "defaultPrevented", "get").mockReturnValue(false);

		const result = beforeunloadEventListener(event);

		expect(result).toBeUndefined();

		eventSpy.mockRestore();
	});

	it("should set and remove `beforeunload` listener", async () => {
		const Component = () => {
			const { addBeforeunload, removeBeforeunload } = useBeforeunload();

			return (
				<>
					<div data-testid="addBeforeunload" onClick={addBeforeunload} />
					<div data-testid="removeBeforeunload" onClick={removeBeforeunload} />
				</>
			);
		};

		const addEventListenerSpy = vi.spyOn(window, "addEventListener").mockImplementation(vi.fn());
		const removeEventListenerSpy = vi.spyOn(window, "removeEventListener").mockImplementation(vi.fn());

		render(<Component />);

		await userEvent.click(screen.getByTestId("addBeforeunload"));
		window.dispatchEvent(new Event("beforeunload"));

		expect(addEventListenerSpy).toHaveBeenCalledWith("beforeunload", beforeunloadEventListener);

		await userEvent.click(screen.getByTestId("removeBeforeunload"));

		expect(removeEventListenerSpy).toHaveBeenCalledWith("beforeunload", beforeunloadEventListener);

		addEventListenerSpy.mockRestore();
		removeEventListenerSpy.mockRestore();
	});
});
