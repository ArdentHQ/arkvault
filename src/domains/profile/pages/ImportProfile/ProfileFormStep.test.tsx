/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as browserAccess from "browser-fs-access";

import { EnvironmentProvider } from "@/app/contexts";
import { ImportProfileForm } from "@/domains/profile/pages/ImportProfile/ProfileFormStep";
import { env, render, renderResponsive, screen, waitFor } from "@/utils/testing-library";
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
			{
				route: "/profiles/import",
			},
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("ProfileFormStep")).toBeInTheDocument();
		expect(screen.getAllByTestId("Input")[0]).toHaveValue(profile.name());
	});

	it("should render profile form with empty profile", async () => {
		const emptyProfile = await env.profiles().create("test2");
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
			{
				route: "/profiles/import",
			},
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
			{
				route: "/profiles/import",
			},
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0];

		const user = userEvent.setup();
		await user.clear(inputElement);
		await user.paste("test profile 1");

		await userEvent.click(screen.getByRole("checkbox"));

		await userEvent.click(screen.getAllByTestId("SelectDropdown__caret")[0]);
		await userEvent.click(screen.getAllByTestId("SelectDropdown__option--0")[0]);

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		expect(emptyProfile.usesPassword()).toBe(false);

		await user.clear(inputElement);
		await user.type(inputElement, "test profile 2");

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
			{
				route: "/profiles/import",
			},
		);

		const user = userEvent.setup();

		await user.clear(screen.getAllByTestId("Input")[0]);
		await user.paste("asdasdas");

		await userEvent.click(screen.getAllByTestId("SelectDropdown__caret")[0]);
		await userEvent.click(screen.getAllByTestId("SelectDropdown__option--0")[0]);
		await userEvent.click(screen.getByRole("checkbox"));

		await user.clear(passwordInput());
		await user.paste("S3cUrePa$sword.test");

		await user.clear(passwordConfirmationInput());
		await user.paste("S3cUrePa$sword.wrong");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		await user.clear(passwordInput());
		await user.paste("S3cUrePa$sword");

		await user.clear(passwordConfirmationInput());
		await user.paste("S3cUrePa$sword");

		await waitFor(() => expect(submitButton()).toBeEnabled());

		await user.clear(passwordConfirmationInput());
		await user.paste("S3cUrePa$sword.test");

		await user.clear(passwordInput());
		await user.paste("S3cUrePa$sword.wrong");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
		expect(screen.getByTestId("Input__error").dataset.errortext).toBe(t("COMMON.VALIDATION.PASSWORD_MISMATCH"));
	});

	it("should render viewing mode select in mobile", async () => {
		const emptyProfile = await env.profiles().create("test5");
		renderResponsive(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={vi.fn()}
					shouldValidate={false}
					onBack={vi.fn()}
				/>
			</EnvironmentProvider>,
			"xs",
		);

		await waitFor(() => expect(screen.getAllByTestId("SelectDropdown__caret")[1]).toBeInTheDocument());
		expect(screen.queryByTestId("ButtonGroup__option--0")).not.toBeInTheDocument();
	});
});
