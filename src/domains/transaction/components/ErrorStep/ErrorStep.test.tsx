import userEvent from "@testing-library/user-event";
import React from "react";

import { ErrorStep } from "./ErrorStep";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("ErrorStep", () => {
	it("should render with default texts", () => {
		const { asFragment } = render(<ErrorStep />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom title", () => {
		const { asFragment } = render(<ErrorStep title="Custom error title" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should display error details", () => {
		const { asFragment } = render(<ErrorStep errorMessage="Display error details" />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should emit onBack", async () => {
		const onBack = jest.fn();
		const { asFragment } = render(<ErrorStep title="Custom error title" onBack={onBack} />);

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__wallet-button"));

		await waitFor(() =>
			expect(onBack).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) })),
		);
	});

	it("should emit onRepeat", async () => {
		const onRepeat = jest.fn();
		const { asFragment } = render(<ErrorStep title="Custom error title" onRepeat={onRepeat} />);

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__repeat-button"));

		await waitFor(() => expect(onRepeat).toHaveBeenCalledWith());
	});
});
