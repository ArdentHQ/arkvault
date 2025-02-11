import React from "react";

import { render, screen } from "@/utils/testing-library";
import { HideBalance } from "./HideBalance";
import userEvent from "@testing-library/user-event";

describe("HideBalance", () => {
	it("should render", () => {
		render(<HideBalance />);

		expect(screen.getByTestId("HideBalance-button")).toBeInTheDocument();
	});

	it("should render with icon hide", async () => {
		render(<HideBalance />);

		const button = screen.getByTestId("HideBalance-button");
		await userEvent.click(button);

		expect(screen.getByTestId("HideBalance-icon-hide")).toBeInTheDocument();
	});

	it("should render with icon show", () => {
		render(<HideBalance />);
		expect(screen.getByTestId("HideBalance-icon-show")).toBeInTheDocument();
	});

	it("should call setHideBalance when clicked", async () => {
		const setHideBalanceSpy = vi.fn();
		const mockContextValue = {
			hideBalance: false,
			setHideBalance: setHideBalanceSpy,
		};

		vi.spyOn(React, "useContext").mockReturnValue(mockContextValue);

		render(<HideBalance />);

		const button = screen.getByTestId("HideBalance-button");
		await userEvent.click(button);

		expect(setHideBalanceSpy).toHaveBeenCalledWith(true);
	});
});
