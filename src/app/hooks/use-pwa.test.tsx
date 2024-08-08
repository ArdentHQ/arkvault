/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";
import { usePwa } from "./use-pwa";

import { act, render, screen, waitFor } from "@/utils/testing-library";

const TestComponent: React.FC = () => {
	const { installPrompt, showInstallBanner, hideInstallBanner, showIOSInstructions } = usePwa();

	if (showIOSInstructions) {
		return <div data-testid="IOsInstructions">Instructions</div>;
	}

	if (!showInstallBanner) {
		return null;
	}

	return (
		<div data-testid="TestComponent">
			<button data-testid="TestComponent__install" onClick={installPrompt}>
				Install
			</button>
			<button data-testid="TestComponent__close" onClick={hideInstallBanner}>
				Hide
			</button>
		</div>
	);
};

describe("usePwa", () => {
	it("should not render anything by default", () => {
		render(<TestComponent />);

		expect(screen.queryByTestId("TestComponent")).not.toBeInTheDocument();
	});

	it("shouldnt show the banner after the beforeinstallprompt event", () => {
		render(<TestComponent />);

		act(() => {
			window.dispatchEvent(new Event("beforeinstallprompt"));
		});

		expect(screen.getByTestId("TestComponent")).toBeInTheDocument();
	});

	it("should close the banner if press the close button", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = vi.spyOn(Storage.prototype, "setItem");
		render(<TestComponent />);

		act(() => {
			window.dispatchEvent(new Event("beforeinstallprompt"));
		});

		await userEvent.click(screen.getByTestId("TestComponent__close"));

		expect(screen.queryByTestId("TestComponent")).not.toBeInTheDocument();

		expect(localstorageSpy).toHaveBeenCalledWith("hidePwaInstallAlert", "true");

		localstorageSpy.mockRestore();
	});

	it("should call prompt method if user clicks on the install button", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = vi.spyOn(Storage.prototype, "setItem");

		render(<TestComponent />);

		const promptFunction = vi.fn().mockResolvedValue({});

		const event = new Event("beforeinstallprompt") as any;

		event.prompt = promptFunction;
		event.userChoice = "accepted";

		act(() => {
			window.dispatchEvent(event);
		});

		await userEvent.click(screen.getByTestId("TestComponent__install"));

		expect(promptFunction).toHaveBeenCalledWith();

		await waitFor(() => expect(screen.queryByTestId("TestComponent")).not.toBeInTheDocument());

		expect(localstorageSpy).toHaveBeenCalledWith("hidePwaInstallAlert", "true");

		localstorageSpy.mockRestore();
	});

	it("should show the install intructions modal if user clicks on the install button on ios", async () => {
		const navigatorSpy = vi
			.spyOn(navigator, "userAgent", "get")
			.mockReturnValue(
				"Mozilla/5.0 (iPhone; CPU iPhone OS 14_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1 Mobile/15E148 Safari/604.1",
			);

		vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = vi.spyOn(Storage.prototype, "setItem");

		render(<TestComponent />);

		await userEvent.click(screen.getByTestId("TestComponent__install"));

		await expect(screen.findByTestId("IOsInstructions")).resolves.toBeVisible();

		expect(localstorageSpy).toHaveBeenCalledWith("hidePwaInstallAlert", "true");

		localstorageSpy.mockRestore();
		navigatorSpy.mockRestore();
	});
});
