import React from "react";
import { screen, within } from "@testing-library/react";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";
import { TransferOverwriteModal } from "./TransferOverwriteModal";
import { render } from "@/utils/testing-library";

const function_ = vi.fn();

const renderComponent = (properties = {}) => {
	render(
		<TransferOverwriteModal
			isOpen={true}
			onCancel={function_}
			onConfirm={function_}
			newData={{ amount: "6", recipientAddress: "address 2" }}
			currentData={{ amount: "7", recipientAddress: "address 1" }}
			{...properties}
		/>,
	);
};

describe("TransferOverwriteModal", () => {
	it("should render the component", () => {
		renderComponent();

		expect(screen.getByText("Overwrite Data")).toBeInTheDocument();
	});

	it("should show the changed blocks", () => {
		renderComponent();

		expect(screen.getByText("Amount")).toBeInTheDocument();

		expect(screen.getByText("Recipient")).toBeInTheDocument();
		const recipientContainer = screen.getByTestId("OverwriteModal__Recipient");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("address 1");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent("address 2");

		expect(screen.queryByText("Memo")).not.toBeInTheDocument();
	});

	it("should show the current and new values", () => {
		renderComponent({
			currentData: { amount: "7", recipientAddress: "address 1" },
			newData: { amount: "6", recipientAddress: "address 2" },
		});

		const recipientContainer = screen.getByTestId("OverwriteModal__Recipient");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("address 1");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent("address 2");
	});

	it("should show N/A if the current or new value is not present", () => {
		renderComponent({
			currentData: { amount: "7", recipientAddress: null },
			newData: { amount: null, recipientAddress: "address 2" },
		});

		const recipientContainer = screen.getByTestId("OverwriteModal__Recipient");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("N/A");
		expect(within(recipientContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent("address 2");

		const amountContainer = screen.getByTestId("OverwriteModal__Amount");
		expect(within(amountContainer).getByTestId("OverwriteDetail__Current")).toHaveTextContent("7");
		expect(within(amountContainer).getByTestId("OverwriteDetail__New")).toHaveTextContent("N/A");
	});

	it("should init the `onCancel` callback when the `Cancel` button is clicked", () => {
		const cancelMock = vi.fn();

		renderComponent({ onCancel: cancelMock });

		userEvent.click(screen.getByTestId("OverwriteModal__cancel-button"));
		expect(cancelMock).toHaveBeenCalledOnce();
	});

	it("should init the `onConfirm` callback when the `Confirm` button is clicked", () => {
		const confirmMock = vi.fn();

		renderComponent({ onConfirm: confirmMock });

		userEvent.click(screen.getByTestId("OverwriteModal__confirm-button"));
		expect(confirmMock).toHaveBeenCalledOnce();
	});

	it("should init the `onConfirm` callback with clear prefilled value", () => {
		const confirmMock = vi.fn();

		renderComponent({ onConfirm: confirmMock });

		// click on the clear prefilled checkbox
		userEvent.click(screen.getByTestId("OverwriteModal__clear_prefilled"));

		userEvent.click(screen.getByTestId("OverwriteModal__confirm-button"));
		expect(confirmMock).toHaveBeenCalledWith(false);
	});
});
