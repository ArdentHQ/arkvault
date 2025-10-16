import userEvent from "@testing-library/user-event";
import React from "react";

import { translations } from "@/app/i18n/common/i18n";
import { render, screen } from "@/utils/testing-library";
import { StopMigrationConfirmationModal } from "./StopMigrationConfirmationModal";

describe("Confirmation Modal", () => {
	it("should render", () => {
		render(<StopMigrationConfirmationModal isOpen={true} onConfirm={vi.fn()} onCancel={vi.fn()} />);

		expect(screen.getByText(translations.LEDGER_MIGRATION.EXIT_MODAL.TITLE)).toBeInTheDocument();
	});

	it("should trigger cancel", async () => {
		const onCancel = vi.fn();

		render(<StopMigrationConfirmationModal onCancel={onCancel} isOpen onConfirm={vi.fn()} />);

		await userEvent.click(screen.getByText(translations.NO));

		expect(onCancel).toHaveBeenCalled();
	});

	it("should trigger confirm", async () => {
		const onConfirm = vi.fn();

		render(<StopMigrationConfirmationModal onCancel={vi.fn()} isOpen onConfirm={onConfirm} />);

		await userEvent.click(screen.getByText(translations.LEDGER_MIGRATION.EXIT_MODAL.STOP_MIGRATION));

		expect(onConfirm).toHaveBeenCalled();
	});
});
