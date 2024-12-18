/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import * as browserAccess from "browser-fs-access";

import { EnvironmentProvider } from "@/app/contexts";
import { ImportProfileForm } from "@/domains/profile/pages/ImportProfile/ProfileFormStep";
import { env, render, screen, waitFor } from "@/utils/testing-library";
import { renderHook } from "@testing-library/react";
import { useTranslation } from "react-i18next";
let profile: Contracts.IProfile;

let browserAccessMock: vi.SpyInstance;

const passwordInput = () => screen.getByTestId("PasswordValidation__password");
const passwordConfirmationInput = () => screen.getByTestId("PasswordValidation__confirmPassword");

const submitButton = () => screen.getByTestId("ProfileForm__submit-button");

describe("Import Profile - Profile Form Step", () => {
	beforeAll(() => {
		profile = env.profiles().first();
	});

	beforeEach(() => {
		// @ts-ignore
		browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File([], "picture.png", { type: "image/png" }));
	});

	afterEach(() => {
		browserAccessMock.mockRestore();
	});

	it("should render profile form", async () => {
		const history = createHashHistory();
		history.push("/profiles/import");

		render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={profile}
					onSubmit={vi.fn()}
					shouldValidate={false}
					onBack={vi.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("ProfileFormStep")).toBeInTheDocument();
		expect(screen.getAllByTestId("Input")[0]).toHaveValue(profile.name());
	});

	it("should render profile form with empty profile", async () => {
		const history = createHashHistory();
		const emptyProfile = await env.profiles().create("test2");
		history.push("/profiles/import");

		render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={vi.fn()}
					shouldValidate={false}
					onBack={vi.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("ProfileFormStep")).toBeInTheDocument();
		expect(screen.getAllByTestId("Input")[0]).toHaveValue("test2");
	});

	it("should store profile", async () => {
		const emptyProfile = await env.profiles().create("test3");
		render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={vi.fn()}
					shouldValidate={false}
					onBack={vi.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0];

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "test profile 1");

		await userEvent.click(screen.getByRole("checkbox"));

		await userEvent.click(screen.getByTestId("SelectDropdown__caret"));
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		expect(emptyProfile.usesPassword()).toBe(false);

		inputElement.select();
		await userEvent.clear(inputElement);
		await userEvent.type(inputElement, "test profile 2");

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		const newProfile = env.profiles().findById(emptyProfile.id());

		await waitFor(() => expect(newProfile.name()).toBe("test profile 2"));

		expect(newProfile.usesPassword()).toBe(false);
	});

	it("should fail password confirmation", async () => {
		const { result } = renderHook(() => useTranslation());
		const { t } = result.current;

		const emptyProfile = await env.profiles().create("test4");
		render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={vi.fn()}
					shouldValidate={false}
					onBack={vi.fn()}
				/>
			</EnvironmentProvider>,
		);

		await userEvent.type(screen.getAllByTestId("Input")[0], "asdasdas");

		await userEvent.click(screen.getByTestId("SelectDropdown__caret"));
		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));
		await userEvent.click(screen.getByRole("checkbox"));

		await userEvent.type(passwordInput(), "S3cUrePa$sword.test");
		await userEvent.type(passwordConfirmationInput(), "S3cUrePa$sword.wrong");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		passwordInput().select();
		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), "S3cUrePa$sword");

		passwordConfirmationInput().select();
		await userEvent.clear(passwordConfirmationInput());
		await userEvent.type(passwordConfirmationInput(), "S3cUrePa$sword");

		await waitFor(() => expect(submitButton()).toBeEnabled());

		passwordConfirmationInput().select();
		await userEvent.clear(passwordConfirmationInput());
		await userEvent.type(passwordConfirmationInput(), "S3cUrePa$sword.test");

		passwordInput().select();
		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), "S3cUrePa$sword.wrong");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(screen.getByTestId("Input__error").dataset.errortext).toBe(t("COMMON.VALIDATION.PASSWORD_MISMATCH"));
	});
});
