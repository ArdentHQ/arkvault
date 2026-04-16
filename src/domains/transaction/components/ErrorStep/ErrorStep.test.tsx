import userEvent from "@testing-library/user-event";
import React from "react";

import { ErrorStep } from "./ErrorStep";
import { render, screen, waitFor } from "@/utils/testing-library";

describe("ErrorStep", () => {
	it("should render with default texts", () => {
		const { asFragment } = render(<ErrorStep />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with custom description", () => {
		const { asFragment } = render(<ErrorStep description="Custom error description" />);

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

	it("should display rejected error description when error message contains 'denied by the user'", () => {
		render(
			<ErrorStep errorMessage="Ledger device: Condition of use not satisfied (denied by the user?) (0x6985)" />,
		);

		expect(screen.getAllByText(/You rejected the transaction on your Ledger device/)).toHaveLength(2);
	});

	it("should emit onBack", async () => {
		const onBack = vi.fn();
		const { asFragment } = render(<ErrorStep title="Custom error title" onBack={onBack} />);

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__back-button"));

		await waitFor(() => expect(onBack).toHaveBeenCalledWith());
	});

	it("should emit onClose", async () => {
		const onClose = vi.fn();
		const { asFragment } = render(<ErrorStep title="Custom error title" onClose={onClose} />);

		expect(asFragment()).toMatchSnapshot();

		userEvent.click(screen.getByTestId("ErrorStep__close-button"));

		await waitFor(() => expect(onClose).toHaveBeenCalledWith());
	});

	it("should render with copy error button", () => {
		const { asFragment } = render(<ErrorStep errorMessage="Test error" withCopyErrorButton={true} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with hidden footer", () => {
		const { asFragment } = render(<ErrorStep hideFooter={true} />);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render with disabled back button", () => {
		const { asFragment } = render(<ErrorStep onBack={vi.fn()} isBackDisabled={true} />);

		expect(asFragment()).toMatchSnapshot();
	});
});
