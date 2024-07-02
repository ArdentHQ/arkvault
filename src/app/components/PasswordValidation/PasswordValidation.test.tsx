import userEvent from "@testing-library/user-event";
import React from "react";
import { useFormContext } from "react-hook-form";

import { FormField } from "@/app/components/Form";
import { InputPassword } from "@/app/components/Input";
import { renderWithForm, screen, waitFor } from "@/utils/testing-library";

import { PasswordValidation } from "./PasswordValidation";

const passwordInput = () => screen.getByTestId("PasswordValidation__password");

describe("PasswordValidation", () => {
	it("should render", () => {
		const { asFragment } = renderWithForm(
			<PasswordValidation
				confirmPasswordField="confirmPassword"
				confirmPasswordFieldLabel="confirmPassword"
				passwordField="password"
				passwordFieldLabel="password"
			/>,
			{
				registerCallback: ({ register }) => {
					register("password");
					register("confirmPassword");
				},
			},
		);

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render password rules", async () => {
		const { asFragment } = renderWithForm(
			<PasswordValidation
				confirmPasswordField="confirmPassword"
				confirmPasswordFieldLabel="confirmPassword"
				passwordField="password"
				passwordFieldLabel="password"
			/>,
			{
				registerCallback: ({ register }) => {
					register("password");
					register("confirmPassword");
				},
			},
		);

		await waitFor(() => expect(screen.queryByTestId("Rules")).not.toBeInTheDocument());

		await userEvent.paste(passwordInput(), "password");

		await expect(screen.findByTestId("Rules")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();

		await userEvent.clear(passwordInput());

		await waitFor(() => expect(screen.queryByTestId("Rules")).not.toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render password rules using current password", async () => {
		const Component: React.VFC = () => {
			const { register } = useFormContext();

			return (
				<>
					<FormField name="currentPassword">
						<InputPassword data-testid={`PasswordValidation__currentPassword`} ref={register()} />
					</FormField>

					<PasswordValidation
						confirmPasswordField="confirmPassword"
						confirmPasswordFieldLabel="confirmPassword"
						passwordField="password"
						passwordFieldLabel="password"
						currentPasswordField="currentPassword"
						optional={false}
					/>
				</>
			);
		};

		const { asFragment } = renderWithForm(<Component />, {
			registerCallback: ({ register }) => {
				register("currentPassword");
				register("password");
				register("confirmPassword");
			},
		});

		await waitFor(() => expect(screen.queryByTestId("Rules")).not.toBeInTheDocument());

		await userEvent.paste(passwordInput(), "password");
		await userEvent.paste(screen.getByTestId("PasswordValidation__currentPassword"), "current password");

		await expect(screen.findByTestId("Rules")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});
});
