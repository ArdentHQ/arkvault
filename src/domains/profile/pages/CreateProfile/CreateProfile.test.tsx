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

		userEvent.click(screen.getByText("Back"));

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
