import React from "react";
import userEvent from "@testing-library/user-event";
import { InstallPWA } from "./InstallPWA";
import { render, screen, act } from "@/utils/testing-library";

let navigatorSpy: vi.SpyInstance;

describe("InstallPWA IOS", () => {
	beforeEach(() => {
		navigatorSpy = vi
			.spyOn(navigator, "userAgent", "get")
			.mockReturnValue(
				"Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
			);
	});

	afterEach(() => {
		navigatorSpy.mockRestore();
	});

	it("should show install banner", () => {
		render(<InstallPWA />);

		expect(screen.getByTestId("InstallPWA")).toBeInTheDocument();
	});

	it("should show ios instructions when clicking install", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = vi.spyOn(Storage.prototype, "setItem");

		render(<InstallPWA />);

		const promptFunction = vi.fn().mockResolvedValue({});

		const event = new Event("beforeinstallprompt") as any;

		event.prompt = promptFunction;
		event.userChoice = "accepted";

		act(() => {
			window.dispatchEvent(event);
		});

		await userEvent.click(screen.getByTestId("InstallPWA__install"));

		await expect(screen.findByTestId("IOsInstructions")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("Modal__close-button"));

		await expect(screen.findByTestId("IOsInstructions")).rejects.toThrow(/Unable to find/);

		localstorageSpy.mockRestore();
	});

	it("should show ios instructions when clicking install and close", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = vi.spyOn(Storage.prototype, "setItem");

		render(<InstallPWA />);

		const promptFunction = vi.fn().mockResolvedValue({});

		const event = new Event("beforeinstallprompt") as any;

		event.prompt = promptFunction;
		event.userChoice = "accepted";

		act(() => {
			window.dispatchEvent(event);
		});

		await userEvent.click(screen.getByTestId("InstallPWA__install"));

		await expect(screen.findByTestId("IOsInstructions")).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("IOsInstructions__close-button"));

		await expect(screen.findByTestId("IOsInstructions")).rejects.toThrow(/Unable to find/);

		localstorageSpy.mockRestore();
	});
});
