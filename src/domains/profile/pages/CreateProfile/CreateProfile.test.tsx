/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable testing-library/no-unnecessary-act */

import { ARK } from "@ardenthq/sdk-mainsail";
import userEvent from "@testing-library/user-event";
import React from "react";
import * as browserAccess from "browser-fs-access";

import { CreateProfile } from "./CreateProfile";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import * as themeUtils from "@/utils/theme";
import { act, env, fireEvent, render, screen, waitFor } from "@/utils/testing-library";

let browserAccessMock: vi.SpyInstance;

const fileOpenParameters = {
	extensions: [".png", ".jpg", ".jpeg", ".bmp"],
};

const profileName = "test profile";

const baseSettings = {
	ACCENT_COLOR: "navy",
	ADVANCED_MODE: false,
	AUTOMATIC_SIGN_OUT_PERIOD: 15,
	BIP39_LOCALE: "english",
	DASHBOARD_TRANSACTION_HISTORY: false,
	DO_NOT_SHOW_FEE_WARNING: false,
	ERROR_REPORTING: false,
	EXCHANGE_CURRENCY: "BTC",
	FALLBACK_TO_DEFAULT_NODES: true,
	LOCALE: "en-US",
	MARKET_PROVIDER: "cryptocompare",
	NAME: profileName,
	THEME: "light",
	TIME_FORMAT: "h:mm A",
	USE_EXPANDED_TABLES: false,
	USE_NETWORK_WALLET_NAMES: false,
	USE_TEST_NETWORKS: false,
};

const BASE64_REGEX = /(?:[\d+/A-Za-z]{4})*(?:[\d+/A-Za-z]{2}==|[\d+/A-Za-z]{3}=)?/g;

const nameInput = () => screen.getAllByTestId("Input")[0];

const uploadButton = () => screen.getByTestId("SelectProfileImage__upload-button");
const submitButton = () => screen.getByTestId("ProfileForm__submit-button");

const passwordInput = () => screen.getByTestId("PasswordValidation__password");
const passwordConfirmationInput = () => screen.getByTestId("PasswordValidation__confirmPassword");

const imageID = "SelectProfileImage__avatar-image";
const avatarID = "SelectProfileImage__avatar-identicon";

const password = "S3cUrePa$sword";
const testPassword = "S3cUrePa$sword.test";
const wrongPassword = "S3cUrePa$sword.wrong";

const renderComponent = async () => {
	const utils = render(<CreateProfile />);

	await waitFor(() => expect(submitButton()).toBeDisabled());

	return utils;
};

describe("CreateProfile", () => {
	beforeAll(() => {
		env.reset({ coins: { ARK }, httpClient, storage: new StubStorage() });
	});

	beforeEach(() => {
		browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File([], "picture.png", { type: "image/png" }));
	});

	afterEach(() => {
		browserAccessMock.mockRestore();
	});

	it("should render", async () => {
		const { asFragment } = await renderComponent();

		userEvent.click(screen.getByText("Back"));

		expect(asFragment()).toMatchSnapshot();
	});

	it("should select currency based on locale", async () => {
		const intlMock = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
			locale: "de-DE",
		});

		await renderComponent();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("EUR (€)");

		intlMock.mockRestore();
	});

	it("should select currency based on navigator.language if country code is missing in the locale options", async () => {
		const intlMock = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
			locale: "en", // no country code, just locale
		});

		const languageMock = vi.spyOn(window.navigator, "language", "get").mockReturnValue("en-GB");

		await renderComponent();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("GBP (£)");

		intlMock.mockRestore();
		languageMock.mockRestore();
	});

	it.each(["en-AE", "sr-CS"])("should fall back to USD if currency is not found", async (locale) => {
		const intlMock = vi.spyOn(Intl.DateTimeFormat.prototype, "resolvedOptions").mockReturnValue({
			locale: "en", // no country code, just locale
		});

		const languageMock = vi.spyOn(window.navigator, "language", "get").mockReturnValue(locale);

		await renderComponent();

		expect(screen.getByTestId("SelectDropdown__input")).toHaveValue("USD ($)");

		intlMock.mockRestore();
		languageMock.mockRestore();
	});

	it("should show password validation rules", async () => {
		await renderComponent();

		userEvent.paste(nameInput(), "test profile 3");
		userEvent.paste(passwordInput(), testPassword);

		await waitFor(() => expect(screen.getByTestId("Rules")).toBeVisible());

		userEvent.clear(passwordInput());

		expect(passwordInput()).not.toHaveValue();

		await waitFor(() => expect(screen.queryByTestId("Rules")).not.toBeInTheDocument());
	});

	it("should store profile with password", async () => {
		await renderComponent();

		userEvent.paste(nameInput(), "test profile 3");
		userEvent.paste(passwordInput(), testPassword);
		userEvent.paste(passwordConfirmationInput(), testPassword);
		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		userEvent.click(submitButton());

		await waitFor(() => expect(env.profiles().last().usesPassword()).toBe(true));
	});

	it("should store profile", async () => {
		await renderComponent();

		// Upload avatar image
		userEvent.click(uploadButton());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		userEvent.paste(nameInput(), "test profile 1");

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		userEvent.clear(selectDropdown);
		await waitFor(() => expect(selectDropdown).not.toHaveValue());

		userEvent.paste(selectDropdown, "BTC");
		await waitFor(() => expect(selectDropdown).toHaveValue("BTC"));

		userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		await act(() => {
			userEvent.click(submitButton());
		});

		const profile = env.profiles().last();

		expect(profile.name()).toBe("test profile 1");
		expect(profile.settings().all()).toStrictEqual({
			...baseSettings,
			AVATAR: expect.stringMatching(BASE64_REGEX),
			NAME: "test profile 1",
		});
		expect(profile.usesPassword()).toBe(false);
	});

	it("should not be able to create new profile if name already exists", async () => {
		const profile = await env.profiles().create(profileName);

		await renderComponent();

		nameInput().select();
		userEvent.paste(nameInput(), "t");
		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		nameInput().select();
		userEvent.paste(nameInput(), profileName);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();

		env.profiles().forget(profile.id());
	});

	it("should not be able to create new profile if name consists only of whitespace", async () => {
		await renderComponent();

		nameInput().select();
		userEvent.paste(nameInput(), "t");
		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		nameInput().select();
		userEvent.paste(nameInput(), "     ");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should not be able to create new profile if name is too long", async () => {
		await renderComponent();

		userEvent.paste(nameInput(), "t");
		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		userEvent.paste(nameInput(), profileName.repeat(10));

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should fail password confirmation", async () => {
		await renderComponent();

		userEvent.paste(nameInput(), "asdasdas");

		userEvent.paste(passwordInput(), testPassword);
		userEvent.paste(passwordConfirmationInput(), wrongPassword);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		passwordInput().select();
		userEvent.paste(passwordInput(), password);

		userEvent.click(screen.getByRole("checkbox"));

		passwordConfirmationInput().select();
		userEvent.paste(passwordConfirmationInput(), password);

		await waitFor(() => expect(submitButton()).toBeEnabled());

		passwordConfirmationInput().select();
		userEvent.paste(passwordConfirmationInput(), testPassword);

		passwordInput().select();
		userEvent.paste(passwordInput(), wrongPassword);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should update the avatar when removing focus from name input", async () => {
		await renderComponent();

		expect(screen.queryByTestId(avatarID)).not.toBeInTheDocument();

		const inputElement: HTMLInputElement = screen.getByTestId("Input");

		userEvent.type(inputElement, "t");
		await waitFor(() => expect(inputElement).toHaveValue("t"));

		expect(inputElement).toHaveFocus();

		fireEvent.blur(inputElement);

		await expect(screen.findByTestId(avatarID)).resolves.toBeVisible();

		inputElement.select();
		userEvent.paste(inputElement, profileName);
		await waitFor(() => expect(inputElement).toHaveValue(profileName));

		expect(inputElement).toHaveFocus();

		fireEvent.blur(inputElement);

		await expect(screen.findByTestId(avatarID)).resolves.toBeVisible();

		userEvent.clear(inputElement);
		await waitFor(() => expect(inputElement).not.toHaveValue());

		expect(inputElement).toHaveFocus();

		fireEvent.blur(inputElement);

		expect(screen.queryByTestId(avatarID)).not.toBeInTheDocument();
	});

	it("should not update the uploaded avatar when removing focus from name input", async () => {
		await renderComponent();

		// Upload avatar image
		userEvent.click(uploadButton());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		await expect(screen.findByTestId(imageID)).resolves.toBeVisible();

		act(() => nameInput().focus());

		userEvent.clear(nameInput());

		await waitFor(() => expect(nameInput()).not.toHaveValue());

		act(() => passwordConfirmationInput().focus());

		expect(screen.getByTestId(imageID)).toBeInTheDocument();
	});

	it("should upload and remove avatar image", async () => {
		await renderComponent();

		const profileCount = env.profiles().count();

		// Upload avatar image
		userEvent.click(uploadButton());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		await expect(screen.findByTestId(imageID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		expect(screen.queryByTestId(imageID)).not.toBeInTheDocument();
		expect(screen.queryByTestId(avatarID)).not.toBeInTheDocument();

		userEvent.paste(nameInput(), "test profile 4");
		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		userEvent.click(submitButton());

		await waitFor(() => expect(env.profiles().count()).toBe(profileCount + 1));
	});

	it("should show identicon when removing image if name is set", async () => {
		await renderComponent();

		userEvent.paste(nameInput(), "test profile 1");
		fireEvent.blur(nameInput());

		// Upload avatar image
		userEvent.click(uploadButton());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		await expect(screen.findByTestId(imageID)).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		expect(screen.getByTestId(avatarID)).toBeInTheDocument();
	});

	it("should not upload avatar image", async () => {
		await renderComponent();

		const profileCount = env.profiles().count();

		browserAccessMock = vi.spyOn(browserAccess, "fileOpen").mockRejectedValue(new Error("Error"));

		userEvent.click(uploadButton());

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		userEvent.paste(nameInput(), "test profile 5");
		userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		userEvent.click(submitButton());

		await waitFor(() => expect(env.profiles().count()).toBe(profileCount + 1));
	});

	it.each([true, false])("should set viewing mode based on system preferences", async (shouldUseDarkColors) => {
		const shouldUseDarkColorsSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(shouldUseDarkColors);

		await renderComponent();

		const lightButton = screen.getAllByRole("radio")[0];
		const darkButton = screen.getAllByRole("radio")[1];

		if (shouldUseDarkColors) {
			expect(lightButton).not.toBeChecked();
			expect(darkButton).toBeChecked();
		} else {
			expect(lightButton).toBeChecked();
			expect(darkButton).not.toBeChecked();
		}

		expect(document.querySelector("html")).toHaveClass(shouldUseDarkColors ? "dark" : "light");

		shouldUseDarkColorsSpy.mockRestore();
	});

	it("should change theme when selecting viewing mode", async () => {
		const shouldUseDarkColorsSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(true);

		await renderComponent();

		const lightButton = screen.getAllByRole("radio")[0];
		const darkButton = screen.getAllByRole("radio")[1];

		expect(document.querySelector("html")).toHaveClass("dark");
		expect(darkButton).toBeChecked();
		expect(lightButton).not.toBeChecked();

		userEvent.click(lightButton);

		expect(document.querySelector("html")).toHaveClass("light");
		expect(lightButton).toBeChecked();
		expect(darkButton).not.toBeChecked();

		shouldUseDarkColorsSpy.mockRestore();
	});
});
