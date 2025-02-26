import React from "react";
import { DeleteAddressMessage } from "./DeleteAddressMessage";
import { render, screen } from "@/utils/testing-library";
import { expect } from "vitest";
import userEvent from "@testing-library/user-event";

describe("DeleteAddressMessage", () => {
	it("should render", () => {
		render(<DeleteAddressMessage onCancelDelete={vi.fn()} onConfirmDelete={vi.fn()} />);
		expect(screen.getByTestId("DeleteAddressMessage")).toBeInTheDocument();
	});

	it("should trigger actions", async () => {
		const onCancel = vi.fn();
		const onConfirm = vi.fn();

		render(<DeleteAddressMessage onCancelDelete={onCancel} onConfirmDelete={onConfirm} />);

		await userEvent.click(screen.getByTestId("CancelDelete"));
		expect(onCancel).toHaveBeenCalled();

		await userEvent.click(screen.getByTestId("ConfirmDelete"));
		expect(onConfirm).toHaveBeenCalled();
	});
});
