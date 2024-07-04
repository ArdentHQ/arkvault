/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";

import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import PasswordSettings from "@/domains/setting/pages/Password";
import { env, getDefaultProfileId, render, screen, waitFor } from "@/utils/testing-library";
const translations = buildTranslations();
const history = createHashHistory();

let profile: Contracts.IProfile;

const passwordInputID = "PasswordValidation__password";
const confirmPasswordInputID = "PasswordValidation__confirmPassword";
const passwordInput = () => screen.getByTestId(passwordInputID);
const confirmPasswordInput = () => screen.getByTestId(confirmPasswordInputID);

const removeButton = () => screen.getByTestId("Password-settings__remove-button");

const currentPasswordInputID = "Password-settings__input--currentPassword";
const confirmModalInputID = "PasswordRemovalConfirmModal__input-password";
const submitID = "Password-settings__submit-button";
const menuItemID = "side-menu__item--password";
const password = "S3cUrePa$sword";
const secondaryPassword = "S3cUrePa$sword2different";

describe("Password Settings", () => {
	beforeEach(async () => {
		profile = env.profiles().findById(getDefaultProfileId());

		await profile.sync();

		history.push(`/profiles/${profile.id()}/settings/password`);
	});

	it("should render password settings", async () => {
		const { container, asFragment } = render(
			<Route exact={false} path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await expect(screen.findByTestId(passwordInputID)).resolves.toBeVisible();

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should set a password", async () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		expect(container).toBeInTheDocument();

		expect(screen.queryByTestId(currentPasswordInputID)).not.toBeInTheDocument();

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("");
		});

		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), password, { delay: 100 });

		await waitFor(() => {
			expect(passwordInput()).toHaveValue(password);
		});

		await userEvent.clear(confirmPasswordInput());
		await userEvent.type(confirmPasswordInput(), password);

		await waitFor(() => {
			expect(confirmPasswordInput()).toHaveValue(password);
		});

		// wait for formState.isValid to be updated
		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		await waitFor(() => {
			expect(screen.getByTestId(submitID)).not.toBeDisabled();
		});

		await userEvent.click(screen.getByTestId(submitID));

		await expect(screen.findByTestId(currentPasswordInputID)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show an error toast if the current password does not match", async () => {
		profile.auth().setPassword(password);
		const toastSpy = vi.spyOn(toasts, "error");
		const authMock = vi.spyOn(profile, "auth").mockImplementation(() => {
			throw new Error("mismatch");
		});

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId(menuItemID)).toBeInTheDocument();
		});

		await userEvent.click(await screen.findByTestId(menuItemID));

		await expect(screen.findByTestId(currentPasswordInputID)).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId(currentPasswordInputID), "wrong!");

		await waitFor(() => {
			expect(screen.getByTestId(currentPasswordInputID)).toHaveValue("wrong!");
		});

		await userEvent.type(passwordInput(), "AnotherS3cUrePa$swordNew");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("AnotherS3cUrePa$swordNew");
		});

		await userEvent.type(confirmPasswordInput(), "AnotherS3cUrePa$swordNew");

		await waitFor(() => {
			expect(screen.getByTestId(submitID)).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId(submitID));

		await waitFor(() => {
			expect(screen.getByTestId(submitID)).toBeEnabled();
		});

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(`${translations.SETTINGS.PASSWORD.ERROR.MISMATCH}`);
		});

		expect(asFragment()).toMatchSnapshot();

		authMock.mockRestore();
	});

	it("should trigger password confirmation mismatch error", async () => {
		profile.auth().setPassword(password);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId(menuItemID)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(menuItemID));

		await expect(screen.findByTestId(currentPasswordInputID)).resolves.toBeVisible();

		await userEvent.clear(screen.getByTestId(currentPasswordInputID));
		await userEvent.type(screen.getByTestId(currentPasswordInputID), password);

		await waitFor(() => {
			expect(screen.getByTestId(currentPasswordInputID)).toHaveValue(password);
		});

		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), secondaryPassword);

		await waitFor(() => expect(passwordInput()).toHaveValue(secondaryPassword));

		await userEvent.type(confirmPasswordInput(), "S3cUrePa$sword2different1");

		await waitFor(() => expect(confirmPasswordInput()).toHaveValue("S3cUrePa$sword2different1"));

		await userEvent.clear(passwordInput(), "new password 2");
		await userEvent.type(passwordInput(), "new password 2");

		await waitFor(() => expect(confirmPasswordInput()).toHaveAttribute("aria-invalid"));
		// wait for formState.isValid to be updated
		await waitFor(() => expect(screen.getByTestId(submitID)).toBeDisabled());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should disable submit button if no password", async () => {
		render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId(menuItemID)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(menuItemID));

		await expect(screen.findByTestId(submitID)).resolves.toBeVisible();

		expect(screen.getByTestId(submitID)).toBeDisabled();
	});

	it("should not allow setting the current password as the new password", async () => {
		profile.auth().setPassword(password);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId(menuItemID)).toBeInTheDocument();
		});

		await userEvent.click(screen.getByTestId(menuItemID));

		await expect(screen.findByTestId(currentPasswordInputID)).resolves.toBeVisible();

		await userEvent.type(screen.getByTestId(currentPasswordInputID), password);

		await waitFor(() => expect(screen.getByTestId(currentPasswordInputID)).toHaveValue(password));

		await userEvent.type(passwordInput(), password);

		await waitFor(() => expect(passwordInput()).toHaveValue(password));

		await waitFor(() => expect(passwordInput()).toHaveAttribute("aria-invalid"));

		await waitFor(() => expect(screen.getByTestId(submitID)).toBeDisabled());

		expect(asFragment()).toMatchSnapshot();
	});

	it("should allow to remove the password", async () => {
		profile.auth().setPassword(password);

		const toastSpy = vi.spyOn(toasts, "success");
		const forgetPasswordSpy = vi.spyOn(profile.auth(), "forgetPassword").mockImplementation(vi.fn());

		render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await userEvent.click(screen.getByTestId(menuItemID));

		expect(removeButton()).toBeInTheDocument();

		await userEvent.click(removeButton());

		expect(screen.getByTestId(confirmModalInputID)).toBeInTheDocument();

		// Close modal and re-open it.

		await userEvent.click(screen.getByTestId("PasswordRemovalConfirmModal__cancel"));

		expect(screen.queryByTestId(confirmModalInputID)).not.toBeInTheDocument();

		await userEvent.click(removeButton());

		await expect(screen.findByTestId(confirmModalInputID)).resolves.toBeVisible();

		// Fill in current password and confirm.

		await userEvent.type(screen.getByTestId(confirmModalInputID), password);

		await waitFor(() => expect(screen.getByTestId("PasswordRemovalConfirmModal__confirm")).toBeEnabled());

		await userEvent.click(screen.getByTestId("PasswordRemovalConfirmModal__confirm"));

		await waitFor(() => expect(screen.queryByTestId(confirmModalInputID)).not.toBeInTheDocument());

		expect(forgetPasswordSpy).toHaveBeenCalledWith(password);
		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.SETTINGS.PASSWORD.REMOVAL.SUCCESS);
		});

		forgetPasswordSpy.mockRestore();
		toastSpy.mockRestore();
	});

	it("should not allow password removal if current password does not match", async () => {
		profile.auth().setPassword(password);

		const toastSpy = vi.spyOn(toasts, "error");

		vi.spyOn(profile.auth(), "forgetPassword").mockImplementationOnce(() => {
			throw new Error("password mismatch");
		});

		render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await userEvent.click(screen.getByTestId(menuItemID));

		expect(removeButton()).toBeInTheDocument();

		await userEvent.click(removeButton());

		expect(screen.getByTestId(confirmModalInputID)).toBeInTheDocument();

		// Fill in wrong current password and confirm.

		await userEvent.clear(screen.getByTestId(confirmModalInputID));
		await userEvent.type(screen.getByTestId(confirmModalInputID), "S3cUrePa$swordWrong");

		await waitFor(() => expect(screen.getByTestId("PasswordRemovalConfirmModal__confirm")).toBeEnabled());

		await userEvent.click(screen.getByTestId("PasswordRemovalConfirmModal__confirm"));

		await waitFor(() => expect(toastSpy).toHaveBeenCalledWith(`${translations.SETTINGS.PASSWORD.ERROR.MISMATCH}`));

		toastSpy.mockRestore();
	});

	it("should change a password", async () => {
		profile.auth().setPassword(password);

		render(
			<Route path="/profiles/:profileId/settings/:activeSetting">
				<PasswordSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings/password`,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("side-menu__item--password")).toBeInTheDocument();
		});

		await userEvent.type(screen.getByTestId("Password-settings__input--currentPassword"), password);

		await waitFor(() => {
			expect(screen.getByTestId("Password-settings__input--currentPassword")).toHaveValue(password);
		});

		await userEvent.type(passwordInput(), secondaryPassword);

		await waitFor(() => {
			expect(passwordInput()).toHaveValue(secondaryPassword);
		});

		await userEvent.type(confirmPasswordInput(), secondaryPassword);

		await waitFor(() => {
			expect(confirmPasswordInput()).toHaveValue(secondaryPassword);
		});

		await waitFor(() => {
			expect(screen.getByTestId("Password-settings__submit-button")).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId("Password-settings__submit-button"));

		await expect(screen.findByTestId(currentPasswordInputID)).resolves.toBeVisible();

		profile.auth().forgetPassword(secondaryPassword);
	});
});
