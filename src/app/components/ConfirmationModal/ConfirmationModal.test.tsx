import userEvent from "@testing-library/user-event";
import React from "react";

import { ConfirmationModal } from "./ConfirmationModal";
import { translations } from "@/app/i18n/common/i18n";
import { render, screen } from "@/utils/testing-library";

describe("Confirmation Modal", () => {
	it("should render with default title and description", () => {
		const { container } = render(<ConfirmationModal isOpen />);

		expect(screen.getByText(translations.CONFIRMATION_MODAL.TITLE)).toBeInTheDocument();
		expect(screen.getByText(translations.CONFIRMATION_MODAL.DESCRIPTION)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should render with custom title and description", () => {
		const title = "My Title";
		const description = "My Description";
		const { container } = render(<ConfirmationModal title={title} description={description} isOpen />);

		expect(screen.getByText(title)).toBeInTheDocument();
		expect(screen.getByText(description)).toBeInTheDocument();
		expect(container).toMatchSnapshot();
	});

	it("should trigger cancel", async () => {
		const onCancel = vi.fn();

		render(<ConfirmationModal onCancel={onCancel} isOpen />);

		await userEvent.click(screen.getByText(translations.NO));

		expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should trigger confirm", async () => {
		const onConfirm = vi.fn();

		render(<ConfirmationModal onConfirm={onConfirm} isOpen />);

		await userEvent.click(screen.getByText(translations.YES));

		expect(onConfirm).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});
});
