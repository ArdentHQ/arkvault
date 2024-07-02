import userEvent from "@testing-library/user-event";
import React from "react";

import { PasswordRemovalConfirmModal } from "./PasswordRemovalConfirmModal";
import { buildTranslations } from "@/app/i18n/helpers";
import { render, screen, waitFor } from "@/utils/testing-library";

const translations = buildTranslations();

describe("PasswordRemovalConfirmModal", () => {
	it("should render", async () => {
		const { asFragment } = render(<PasswordRemovalConfirmModal onCancel={vi.fn()} onConfirm={vi.fn()} />);

		await expect(screen.findByText(translations.SETTINGS.PASSWORD.REMOVAL.PROFILE_PASSWORD)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should call onCancel when closed", async () => {
		const onCancel = vi.fn();

		render(<PasswordRemovalConfirmModal onCancel={onCancel} onConfirm={vi.fn()} />);

		await expect(screen.findByText(translations.SETTINGS.PASSWORD.REMOVAL.PROFILE_PASSWORD)).resolves.toBeVisible();

		await userEvent.click(screen.getByTestId("PasswordRemovalConfirmModal__cancel"));

		expect(onCancel).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should call onConfirm when submitted", async () => {
		const onConfirm = vi.fn();

		render(<PasswordRemovalConfirmModal onCancel={vi.fn()} onConfirm={onConfirm} />);

		await expect(screen.findByText(translations.SETTINGS.PASSWORD.REMOVAL.PROFILE_PASSWORD)).resolves.toBeVisible();

		expect(screen.getByTestId("PasswordRemovalConfirmModal__confirm")).toBeDisabled();

		await userEvent.type(screen.getByTestId("PasswordRemovalConfirmModal__input-password"), "password");

		await waitFor(() => expect(screen.getByTestId("PasswordRemovalConfirmModal__confirm")).not.toBeDisabled());

		await userEvent.click(screen.getByTestId("PasswordRemovalConfirmModal__confirm"));

		await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("password"));
	});
});
