import React from "react";
import userEvent from "@testing-library/user-event";
import { MigrationDisclaimer } from "./MigrationDisclaimer";
import { translations } from "@/domains/migration/i18n";
import { render, screen } from "@/utils/testing-library";

describe("MigrationDisclaimer", () => {
	it("should render the modal", async () => {
		const { asFragment } = render(<MigrationDisclaimer isOpen={true} onConfirm={vi.fn()} />);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.DISCLAIMER_MODAL.TITLE);
		expect(asFragment()).toMatchSnapshot();
	});

	it("disables the confirm button until user checks the disclaimer", async () => {
		const onConfirm = vi.fn();

		render(<MigrationDisclaimer isOpen={true} onConfirm={onConfirm} />);

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).toBeDisabled();

		userEvent.click(screen.getByTestId("MigrationDisclaimer-checkbox"));

		expect(screen.getByTestId("MigrationDisclaimer__submit-button")).not.toBeDisabled();

		userEvent.click(screen.getByTestId("MigrationDisclaimer__submit-button"));

		expect(onConfirm).toHaveBeenCalled();
	});

	it("handles the cancel button", async () => {
		const onCancel = vi.fn();

		render(<MigrationDisclaimer isOpen={true} onConfirm={vi.fn()} onCancel={onCancel} />);

		userEvent.click(screen.getByTestId("MigrationDisclaimer__cancel-button"));

		expect(onCancel).toHaveBeenCalled();
	});
});
