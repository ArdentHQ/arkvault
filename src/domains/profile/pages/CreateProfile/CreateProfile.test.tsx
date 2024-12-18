/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/await-thenable */
/* eslint-disable testing-library/no-unnecessary-act */

import { ARK } from "@ardenthq/sdk-ark";
import userEvent from "@testing-library/user-event";
import React from "react";

import { CreateProfile } from "./CreateProfile";
import { httpClient } from "@/app/services";
import { StubStorage } from "@/tests/mocks";
import * as themeUtils from "@/utils/theme";
import { act, env, render, screen, waitFor } from "@/utils/testing-library";
import { createHashHistory } from "history";

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

const submitButton = () => screen.getByTestId("ProfileForm__submit-button");

const passwordInput = () => screen.getByTestId("PasswordValidation__password");
const passwordConfirmationInput = () => screen.getByTestId("PasswordValidation__confirmPassword");

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

	it("should render", async () => {
		await renderComponent();

		userEvent.click(screen.getByText("Back"));
		expect(screen.getByTestId("CreateProfile")).toBeInTheDocument();
	});

	it("should navigate back", async () => {
		const history = createHashHistory();

		render(<CreateProfile />, { history });

		expect(screen.getByTestId("CreateProfile")).toBeInTheDocument();

		const historySpy = vi.spyOn(history, "push");

		await userEvent.click(screen.getByText("Back"));

		expect(historySpy).toHaveBeenCalledWith(`/`);

		historySpy.mockRestore();
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

		await userEvent.type(nameInput(), "test profile 3");
		await userEvent.type(passwordInput(), testPassword);

		await waitFor(() => expect(screen.getByTestId("Rules")).toBeVisible());

		await userEvent.clear(passwordInput());

		expect(passwordInput()).not.toHaveValue();

		await waitFor(() => expect(screen.queryByTestId("Rules")).not.toBeInTheDocument());
	});

	it("should store profile with password", async () => {
		await renderComponent();

		await userEvent.type(nameInput(), "test profile 3");
		await userEvent.type(passwordInput(), testPassword);
		await userEvent.type(passwordConfirmationInput(), testPassword);
		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		await userEvent.click(submitButton());

		await waitFor(() => expect(env.profiles().last().usesPassword()).toBe(true));
	});

	it("should store profile", async () => {
		await renderComponent();

		await userEvent.type(nameInput(), "test profile 1");

		const selectDropdown = screen.getByTestId("SelectDropdown__input");

		await userEvent.clear(selectDropdown);
		await waitFor(() => expect(selectDropdown).not.toHaveValue());

		await userEvent.type(selectDropdown, "BTC");
		await waitFor(() => expect(selectDropdown).toHaveValue("BTC"));

		await userEvent.click(screen.getByTestId("SelectDropdown__option--0"));

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		await act(async () => {
			await userEvent.click(submitButton());
		});

		const profile = env.profiles().last();

		expect(profile.name()).toBe("test profile 1");
		expect(profile.settings().all()).toStrictEqual({
			...baseSettings,
			NAME: "test profile 1",
		});
		expect(profile.usesPassword()).toBe(false);
	});

	it("should navigate to dashboard after creating profile", async () => {
		const history = createHashHistory();

		render(<CreateProfile />, { history });

		await userEvent.type(nameInput(), "test profile 2");

		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		const historySpy = vi.spyOn(history, "push");

		await userEvent.click(submitButton());

		const profile = env.profiles().last();

		expect(historySpy).toHaveBeenCalledWith(`/profiles/${profile.id()}/dashboard`);

		historySpy.mockRestore();
	});

	it("should not be able to create new profile if name already exists", async () => {
		const profile = await env.profiles().create(profileName);

		await renderComponent();

		nameInput().select();
		await userEvent.type(nameInput(), "t");
		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		nameInput().select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), profileName);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();

		env.profiles().forget(profile.id());
	});

	it("should not be able to create new profile if name consists only of whitespace", async () => {
		await renderComponent();

		nameInput().select();
		await userEvent.type(nameInput(), "t");
		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		nameInput().select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), "     ");

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should not be able to create new profile if name is too long", async () => {
		await renderComponent();

		await userEvent.type(nameInput(), "t");
		await userEvent.click(screen.getByRole("checkbox"));

		await waitFor(() => expect(submitButton()).toBeEnabled());

		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), profileName.repeat(10));

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
	});

	it("should fail password confirmation", async () => {
		await renderComponent();

		await userEvent.type(nameInput(), "asdasdas");

		await userEvent.type(passwordInput(), testPassword);
		await userEvent.type(passwordConfirmationInput(), wrongPassword);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		passwordInput().select();
		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), password);

		await userEvent.click(screen.getByRole("checkbox"));

		passwordConfirmationInput().select();
		await userEvent.clear(passwordConfirmationInput());
		await userEvent.type(passwordConfirmationInput(), password);

		await waitFor(() => expect(submitButton()).toBeEnabled());

		passwordConfirmationInput().select();
		await userEvent.clear(passwordConfirmationInput());
		await userEvent.type(passwordConfirmationInput(), testPassword);

		passwordInput().select();
		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), wrongPassword);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		expect(screen.getByTestId("Input__error")).toBeVisible();
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

		await userEvent.click(lightButton);

		expect(document.querySelector("html")).toHaveClass("light");
		expect(lightButton).toBeChecked();
		expect(darkButton).not.toBeChecked();

		shouldUseDarkColorsSpy.mockRestore();
	});
});
