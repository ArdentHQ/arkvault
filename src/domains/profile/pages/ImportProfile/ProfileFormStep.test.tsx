/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import * as browserAccess from "browser-fs-access";

import { EnvironmentProvider } from "@/app/contexts";
import { ImportProfileForm } from "@/domains/profile/pages/ImportProfile/ProfileFormStep";
import * as themeUtils from "@/utils/theme";
import { act, env, fireEvent, render, screen, waitFor } from "@/utils/testing-library";
let profile: Contracts.IProfile;

let browserAccessMock: jest.SpyInstance;

const passwordInput = () => screen.getByTestId("PasswordValidation__password");
const passwordConfirmationInput = () => screen.getByTestId("PasswordValidation__confirmPassword");

const submitButton = () => screen.getByTestId("ProfileForm__submit-button");

describe("Import Profile - Profile Form Step", () => {
	beforeAll(() => {
		profile = env.profiles().first();
	});

	beforeEach(() => {
		// @ts-ignore
		browserAccessMock = jest
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File([], "picture.png", { type: "image/png" }));
	});

	afterEach(() => {
		browserAccessMock.mockRestore();
	});

	it("should render profile form", async () => {
		const history = createHashHistory();
		history.push("/profiles/import");

		const { container } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={profile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(container).toMatchSnapshot();
	});

	it("should render profile form with empty profile", async () => {
		const history = createHashHistory();
		const emptyProfile = await env.profiles().create("test2");
		history.push("/profiles/import");

		const { container } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(container).toMatchSnapshot();
	});

	it("should store profile", async () => {
		const emptyProfile = await env.profiles().create("test3");
		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		expect(browserAccessMock).toHaveBeenCalledWith({ extensions: [".png", ".jpg", ".jpeg", ".bmp"] });

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0];

		inputElement.select();
		userEvent.paste(inputElement, "test profile 1");

		userEvent.click(screen.getByRole("checkbox"));

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));
		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		userEvent.click(submitButton());

		expect(emptyProfile.usesPassword()).toBe(false);

		inputElement.select();
		userEvent.paste(inputElement, "test profile 2");

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		userEvent.click(submitButton());

		const newProfile = env.profiles().findById(emptyProfile.id());

		await waitFor(() => expect(newProfile.name()).toBe("test profile 2"));

		expect(newProfile.usesPassword()).toBe(false);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should fail password confirmation", async () => {
		const emptyProfile = await env.profiles().create("test4");
		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={false}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		userEvent.paste(screen.getAllByTestId("Input")[0], "asdasdas");

		userEvent.click(screen.getByTestId("SelectDropdown__caret"));
		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));
		userEvent.click(screen.getByRole("checkbox"));

		userEvent.paste(passwordInput(), "S3cUrePa$sword.test");
		userEvent.paste(passwordConfirmationInput(), "S3cUrePa$sword.wrong");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		passwordInput().select();
		userEvent.paste(passwordInput(), "S3cUrePa$sword");

		passwordConfirmationInput().select();
		userEvent.paste(passwordConfirmationInput(), "S3cUrePa$sword");

		await waitFor(() => expect(submitButton()).toBeEnabled());

		passwordConfirmationInput().select();
		userEvent.paste(passwordConfirmationInput(), "S3cUrePa$sword.test");

		passwordInput().select();
		userEvent.paste(passwordInput(), "S3cUrePa$sword.wrong");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update the avatar when removing focus from name input", async () => {
		const emptyProfile = await env.profiles().create("test6");
		const shouldUseDarkColorsSpy = jest.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(false);

		const { asFragment } = render(
			<EnvironmentProvider env={env}>
				<ImportProfileForm
					env={env}
					profile={emptyProfile}
					onSubmit={jest.fn()}
					shouldValidate={true}
					onBack={jest.fn()}
				/>
			</EnvironmentProvider>,
		);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		const inputElement: HTMLInputElement = screen.getAllByTestId("Input")[0] as HTMLInputElement;

		act(() => inputElement.focus());

		fireEvent.blur(inputElement);

		inputElement.select();
		userEvent.paste(inputElement, "t");

		act(() => passwordConfirmationInput().focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		inputElement.select();
		userEvent.paste(inputElement, "te");

		act(() => passwordInput().focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		act(() => inputElement.focus());

		inputElement.select();
		userEvent.paste(inputElement, "test profile");

		await waitFor(() => {
			expect(inputElement).toHaveValue("test profile");
		});

		act(() => passwordInput().focus());

		expect(screen.getByTestId("SelectProfileImage__avatar-identicon")).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		act(() => inputElement.focus());

		userEvent.clear(inputElement);

		await waitFor(() => {
			expect(inputElement).not.toHaveValue();
		});

		act(() => passwordInput().focus());

		expect(screen.queryByTestId("SelectProfileImage__avatar")).not.toBeInTheDocument();

		// Upload avatar image
		userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		expect(() => screen.getByTestId("SelectProfileImage__avatar")).toBeTruthy();

		act(() => inputElement.focus());

		inputElement.select();
		userEvent.paste(inputElement, "t");

		await waitFor(() => {
			expect(inputElement).toHaveValue("t");
		});

		fireEvent.blur(inputElement);

		expect(asFragment()).toMatchSnapshot();

		shouldUseDarkColorsSpy.mockRestore();
	});
});
