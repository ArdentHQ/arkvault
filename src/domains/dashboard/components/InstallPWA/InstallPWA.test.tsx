import React from "react";
import userEvent from "@testing-library/user-event";
import { InstallPWA } from "./InstallPWA";
import { render, screen, act, waitFor } from "@/utils/testing-library";

describe("InstallPWA", () => {
	it("should not render anything by default", () => {
		render(<InstallPWA />);

		expect(screen.queryByTestId("InstallPWA")).not.toBeInTheDocument();
	});

	it("shouldnt show the banner after the beforeinstallprompt event", () => {
		render(<InstallPWA />);

		act(() => {
			window.dispatchEvent(new Event("beforeinstallprompt"));
		});

		expect(screen.getByTestId("InstallPWA")).toBeInTheDocument();
	});

	it("should close the banner if press the close button", async () => {
		vi.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = vi.spyOn(Storage.prototype, "setItem");
		render(<InstallPWA />);

		act(() => {
			window.dispatchEvent(new Event("beforeinstallprompt"));
		});

		await userEvent.click(screen.getByTestId("InstallPWA__close"));

		expect(screen.queryByTestId("InstallPWA")).not.toBeInTheDocument();

		expect(localstorageSpy).toHaveBeenCalledWith("hidePwaInstallAlert", "true");

		localstorageSpy.mockRestore();
	});

	it("should call prompt method if user clicks on the install button", async () => {
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

		expect(promptFunction).toHaveBeenCalledWith();

		await waitFor(() => expect(screen.queryByTestId("InstallPWA")).not.toBeInTheDocument());

		expect(localstorageSpy).toHaveBeenCalledWith("hidePwaInstallAlert", "true");

		localstorageSpy.mockRestore();
	});
});
