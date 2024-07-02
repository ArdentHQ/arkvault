import userEvent from "@testing-library/user-event";
import React from "react";

import { render, screen, waitFor } from "@/utils/testing-library";

import { ErrorStep } from "./ErrorStep";

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
		const onBack = vi.fn();
		const { asFragment } = render(<ErrorStep title="Custom error title" onBack={onBack} />);

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("ErrorStep__back-button"));

		await waitFor(() => expect(onBack).toHaveBeenCalledWith());
	});

	it("should emit onClose", async () => {
		const onClose = vi.fn();
		const { asFragment } = render(<ErrorStep title="Custom error title" onClose={onClose} />);

		expect(asFragment()).toMatchSnapshot();

		await userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		await waitFor(() => expect(onClose).toHaveBeenCalledWith());
	});
});
