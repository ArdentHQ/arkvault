import userEvent from "@testing-library/user-event";
import React from "react";

import { EncryptPasswordStep } from "./EncryptPasswordStep";
import { renderWithForm, screen, waitFor } from "@/utils/testing-library";

describe("EncryptPasswordStep", () => {
	const passwordValue = "123"

	it("should render", () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		expect(asFragment).toMatchSnapshot();
	});

	it("should change password", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passwordValue);

		await waitFor(() => expect(passwordInput).toHaveValue(passwordValue));

		expect(asFragment).toMatchSnapshot();
	});

	it("should trigger password confirmation validation when password is entered", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />, {
			defaultValues: { confirmEncryptionPassword: "123" },
		});

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, passwordValue, { delay: 100 });

		await waitFor(() => expect(passwordInput).toHaveValue(passwordValue));

		await userEvent.clear(confirmPassword);
		await userEvent.type(confirmPassword, passwordValue, { delay: 100 });

		expect(asFragment()).toMatchSnapshot();
	}, 10_000);
});
