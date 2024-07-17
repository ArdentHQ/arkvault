/* eslint-disable @typescript-eslint/require-await */
import userEvent from "@testing-library/user-event";
import React from "react";

import { EncryptPasswordStep } from "./EncryptPasswordStep";
import { renderWithForm, screen, waitFor } from "@/utils/testing-library";

describe("EncryptPasswordStep", () => {
	it("should render", () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		expect(screen.getByTestId("EncryptPassword")).toBeInTheDocument();
		expect(asFragment).toMatchSnapshot();
	});

	it("should change password", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />);

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, "password");

		await waitFor(() => expect(passwordInput).toHaveValue("password"));

		expect(asFragment).toMatchSnapshot();
	});

	it("should trigger password confirmation validation when password is entered", async () => {
		const { asFragment } = renderWithForm(<EncryptPasswordStep />, {
			defaultValues: { confirmEncryptionPassword: "password" },
		});

		const passwordInput = screen.getByTestId("PasswordValidation__encryptionPassword");
		const confirmPassword = screen.getByTestId("PasswordValidation__confirmEncryptionPassword");

		await userEvent.clear(passwordInput);
		await userEvent.type(passwordInput, "password", 
			{ delay: 50 }
		);
		await userEvent.clear(confirmPassword);
		await userEvent.type(confirmPassword, "password", 
			{ delay: 50 }
		);

		await waitFor(() => expect(passwordInput).toHaveValue("password"));
		await waitFor(() => expect(confirmPassword).toHaveValue("password"));

		expect(asFragment).toMatchSnapshot();
	});
});
