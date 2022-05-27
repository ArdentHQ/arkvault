import userEvent from "@testing-library/user-event";
import React from "react";

import { BetaNotice } from "./BetaNotice";
import { render, screen } from "@/utils/testing-library";

let localstorageSpy: jest.SpyInstance;

describe("BetaNotice", () => {
	beforeEach(() => {
		localstorageSpy = jest.spyOn(Storage.prototype, "getItem").mockReturnValue(undefined);
	});

	afterEach(() => {
		localstorageSpy.mockRestore();
	});

	it("should render", () => {
		const { asFragment } = render(<BetaNotice onContinue={jest.fn()} />);

		expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		expect(screen.getByText("Payvo Beta Testing")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should have the continue button disabled by default", () => {
		render(<BetaNotice onContinue={jest.fn()} />);

		expect(screen.getByTestId("BetaNoticeModal__submit-button")).toBeDisabled();
	});

	it("should enable the continue button when user agrees", () => {
		render(<BetaNotice onContinue={jest.fn()} />);

		userEvent.click(screen.getByTestId("BetaNoticeModal__agree"));

		expect(screen.getByTestId("BetaNoticeModal__submit-button")).not.toBeDisabled();
	});
});
