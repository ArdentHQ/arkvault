/* eslint-disable testing-library/no-node-access */
/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import React from "react";
import { Route } from "react-router-dom";
import * as browserAccess from "browser-fs-access";

import { useAccentColor, useTheme } from "@/app/hooks";
import { buildTranslations } from "@/app/i18n/helpers";
import { toasts } from "@/app/services";
import GeneralSettings from "@/domains/setting/pages/General";
import { act, env, fireEvent, getDefaultProfileId, render, screen, waitFor, within } from "@/utils/testing-library";
import { translations as commonTranslations } from "@/app/i18n/common/i18n";
import { renderHook } from "@testing-library/react";

const translations = buildTranslations();

let profile: Contracts.IProfile;
let browserAccessMock: vi.SpyInstance;

const fileOpenParameters = {
	extensions: [".png", ".jpg", ".jpeg", ".bmp"],
};

const submitButton = () => screen.getByTestId("General-settings__submit-button");
const autoSignout = () => screen.getByTestId("General-settings__auto-signout");
const nameInput = () => screen.getByTestId("General-settings__input--name");

const avatarImage = () => screen.getByTestId("SelectProfileImage__avatar-image");
const avatarIdenticon = () => screen.getByTestId("SelectProfileImage__avatar-identicon");

const resetSubmitID = "ResetProfile__submit-button";

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

describe("General Settings", () => {
	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	beforeEach(() => {
		browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockResolvedValue(new File([], "picture.png", { type: "image/png" }));
	});

	afterEach(() => {
		browserAccessMock.mockRestore();
	});

	it("should render with prompt paths", async () => {
		const history = createHashHistory();

		history.push(`/profiles/${profile.id()}/settings`);

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		// Idle
		history.push(`/profiles/${profile.id()}/dashboard`);

		await userEvent.type(nameInput(), "My Profile");

		await waitFor(() => expect(submitButton()).toBeEnabled());

		// Dirty
		history.replace(`/profiles/${profile.id()}/dashboard`);

		// Reload
		history.replace(`/profiles/${profile.id()}/settings`);
	});

	it("should render", async () => {
		const { container, asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should disable submit button when profile is not restored yet", async () => {
		const isProfileRestoredMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		expect(submitButton()).toBeDisabled();
		expect(asFragment()).toMatchSnapshot();

		isProfileRestoredMock.mockRestore();
	});

	it("should update the avatar when removing focus from name input", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		expect(avatarIdenticon()).toBeInTheDocument();

		act(() => nameInput().focus());

		await userEvent.clear(nameInput());
		fireEvent.blur(nameInput());

		await userEvent.type(nameInput(), "t");
		fireEvent.blur(nameInput());

		expect(avatarIdenticon()).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();

		act(() => nameInput().focus());

		await userEvent.clear(nameInput());

		await waitFor(() => expect(nameInput()).not.toHaveValue());

		act(() => submitButton().focus());

		act(() => nameInput().focus());

		await userEvent.clear(nameInput());

		await waitFor(() => expect(nameInput()).not.toHaveValue());

		act(() => submitButton().focus());

		expect(screen.queryByTestId("SelectProfileImage__avatar")).not.toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should show identicon when removing image if name is set", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		// Upload avatar image
		await userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		await waitFor(() => expect(avatarImage()).toBeInTheDocument());

		await userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		await waitFor(() => expect(avatarIdenticon()).toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		browserAccessMock.mockRestore();
	});

	it("should not update the uploaded avatar when removing focus from name input", async () => {
		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		await userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		await waitFor(() => expect(avatarImage()).toBeInTheDocument());

		act(() => nameInput().focus());

		await userEvent.clear(nameInput());

		await waitFor(() => {
			expect(nameInput()).not.toHaveValue();
		});

		fireEvent.blur(nameInput());

		expect(avatarImage()).toBeInTheDocument();

		act(() => nameInput().focus());

		await userEvent.type(nameInput(), "t");

		await waitFor(() => {
			expect(nameInput()).toHaveValue("t");
		});

		await userEvent.click(document.body);

		expect(avatarImage()).toBeInTheDocument();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should update profile", async () => {
		const toastSpy = vi.spyOn(toasts, "success");

		const profilesCount = env.profiles().count();

		const { asFragment } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		await userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		await waitFor(() => expect(avatarImage()).toBeInTheDocument());

		await userEvent.type(nameInput(), "test profile");

		// change auto signout period
		expect(within(autoSignout()).getByTestId("select-list__input")).toHaveValue("15");

		await userEvent.click(within(autoSignout()).getByTestId("SelectDropdown__caret"));

		const firstOption = within(autoSignout()).getByTestId("SelectDropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		await userEvent.click(firstOption);

		expect(within(autoSignout()).getByTestId("select-list__input")).toHaveValue("1");

		expect(submitButton()).toBeEnabled();

		await userEvent.click(submitButton());

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.SETTINGS.GENERAL.SUCCESS);
		});

		// Remove avatar image
		await userEvent.click(screen.getByTestId("SelectProfileImage__remove-button"));

		await waitFor(() => expect(avatarIdenticon()).toBeInTheDocument());

		await userEvent.type(nameInput(), "t");
		await waitFor(() => expect(submitButton()).toBeEnabled());
		await userEvent.clear(nameInput());
		await waitFor(() => expect(submitButton()).toBeDisabled());
		await userEvent.type(nameInput(), "test profile 2");

		await waitFor(() => expect(submitButton()).toBeEnabled());

		await userEvent.click(submitButton());

		// Not upload avatar image
		browserAccessMock = vi
			.spyOn(browserAccess, "fileOpen")
			.mockRejectedValue(new Error("The user aborted a request"));

		await userEvent.click(screen.getByTestId("SelectProfileImage__upload-button"));

		await waitFor(() => expect(browserAccessMock).toHaveBeenCalledWith(fileOpenParameters));

		expect(env.profiles().count()).toBe(profilesCount);
		expect(asFragment()).toMatchSnapshot();

		toastSpy.mockRestore();
	});

	it("should not update profile if name consists only of whitespace", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), "     ");

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => expect(submitButton()).toBeDisabled());
	});

	it("should not update profile if profile name exists", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), otherProfile!.name());

		await waitFor(() => {
			expect(screen.getByTestId("Input__error")).toBeVisible();
		});

		await waitFor(() => expect(submitButton()).toBeDisabled());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), "unique profile name");

		await waitFor(() => expect(submitButton()).toBeEnabled());
	});

	it("should not update profile if profile name exists (uppercase)", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));
		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), otherProfile!.name().toUpperCase());

		await waitFor(() => expect(submitButton()).toBeDisabled());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), "unique profile name");

		await waitFor(() => expect(submitButton()).toBeEnabled());
	});

	it("should not update profile if profile name is too long", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		(nameInput() as HTMLInputElement).select();
		await userEvent.type(nameInput(), "test profile".repeat(10));

		await waitFor(() => expect(submitButton()).toBeDisabled());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), "unique profile name");

		await waitFor(() => expect(submitButton()).toBeEnabled());
	});

	it("should not update profile if profile name exists (padded)", async () => {
		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));
		const otherProfile = env
			.profiles()
			.values()
			.find((element: Contracts.IProfile) => element.id() !== profile.id());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), `  ${otherProfile?.name()}  `);

		await waitFor(() => expect(submitButton()).toBeDisabled());

		(nameInput() as HTMLInputElement).select();
		await userEvent.clear(nameInput());
		await userEvent.type(nameInput(), "unique profile name");

		await waitFor(() => expect(submitButton()).toBeEnabled());
	});

	it.each([
		["close", "Modal__close-button"],
		["cancel", "ResetProfile__cancel-button"],
		["reset", resetSubmitID],
	])("should open & close reset profile modal (%s)", async (_, buttonId) => {
		const { container } = render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		expect(container).toBeInTheDocument();

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		await userEvent.click(screen.getByRole("button", { name: new RegExp(commonTranslations.RESET) }));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await userEvent.click(screen.getByTestId(buttonId));

		await waitFor(() => {
			expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();
		});
	});

	it("should reset fields on reset", async () => {
		const toastSpy = vi.spyOn(toasts, "success");

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		await waitFor(() => {
			expect(submitButton()).toBeDisabled();
		});

		await userEvent.type(nameInput(), "new profile name");

		await waitFor(() => {
			expect(submitButton()).toBeEnabled();
		});

		await userEvent.click(submitButton());

		const buttonRegex = new RegExp(commonTranslations.RESET);

		await waitFor(() => {
			expect(screen.getByRole("button", { name: buttonRegex })).toBeInTheDocument();
		});

		await userEvent.click(screen.getByRole("button", { name: buttonRegex }));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await waitFor(() => {
			expect(screen.getByTestId(resetSubmitID)).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId(resetSubmitID));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.SETTINGS.GENERAL.SUCCESS);
		});

		toastSpy.mockRestore();
	});

	it("should reset appearance settings on reset", async () => {
		const toastSpy = vi.spyOn(toasts, "success");
		const { setAccentColor, getCurrentAccentColor } = useAccentColor();
		const {
			result: { current },
		} = renderHook(() => useTheme());
		const { setTheme, theme } = current;

		expect(getCurrentAccentColor()).toBe("navy");
		expect(document.body.classList.contains("dark")).toBe(false);

		setAccentColor("green");
		setTheme("dark");

		expect(getCurrentAccentColor()).toBe("green");
		// expect(document.body.classList.contains("dark")).toBe(true);
		expect(document.querySelector("html").classList.contains("dark")).toBe(true);

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		const buttonRegex = new RegExp(commonTranslations.RESET);

		await waitFor(() => {
			expect(screen.getByRole("button", { name: buttonRegex })).toBeInTheDocument();
		});

		await userEvent.click(screen.getByRole("button", { name: buttonRegex }));

		await waitFor(() => {
			expect(screen.getByTestId("Modal__inner")).toBeInTheDocument();
		});

		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(translations.PROFILE.MODAL_RESET_PROFILE.TITLE);
		expect(screen.getByTestId("Modal__inner")).toHaveTextContent(
			translations.PROFILE.MODAL_RESET_PROFILE.DESCRIPTION,
		);

		await waitFor(() => {
			expect(screen.getByTestId(resetSubmitID)).toBeEnabled();
		});

		await userEvent.click(screen.getByTestId(resetSubmitID));

		await waitFor(() => {
			expect(toastSpy).toHaveBeenCalledWith(translations.PROFILE.MODAL_RESET_PROFILE.SUCCESS);
		});

		expect(getCurrentAccentColor()).toBe("navy");
		expect(theme).toBe("light");

		toastSpy.mockRestore();
	});

	it("should default to USD if market provider does not support the selected currency", async () => {
		const toastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		const currencyContainer: HTMLElement = screen.getAllByRole("combobox")[1];
		const marketPriceContainer: HTMLElement = screen.getAllByRole("combobox")[3];

		const getSelectInput = (type: "MARKET_PROVIDER" | "CURRENCY") => {
			let subject: HTMLElement;

			if (type === "MARKET_PROVIDER") {
				subject = marketPriceContainer;
			} else {
				subject = currencyContainer;
			}

			return within(subject).getByRole("textbox");
		};

		expect(getSelectInput("MARKET_PROVIDER")).toHaveValue("CryptoCompare");
		expect(getSelectInput("CURRENCY")).toHaveValue("USD ($)");

		await userEvent.click(within(currencyContainer).getByTestId("SelectDropdown__caret"));

		expect(screen.queryByText("VND (₫)")).not.toBeInTheDocument();

		await userEvent.click(screen.getByText("EUR (€)"));

		expect(getSelectInput("CURRENCY")).toHaveValue("EUR (€)");

		await userEvent.click(within(marketPriceContainer).getByTestId("SelectDropdown__caret"));

		await userEvent.click(screen.getByText("CoinGecko"));

		expect(getSelectInput("MARKET_PROVIDER")).toHaveValue("CoinGecko");

		await userEvent.click(within(currencyContainer).getByTestId("SelectDropdown__caret"));

		await userEvent.click(screen.getByText("VND (₫)"));

		expect(getSelectInput("CURRENCY")).toHaveValue("VND (₫)");

		await userEvent.click(within(marketPriceContainer).getByTestId("SelectDropdown__caret"));

		await userEvent.click(screen.getByText("CryptoCompare"));

		expect(getSelectInput("MARKET_PROVIDER")).toHaveValue("CryptoCompare");

		expect(toastSpy).toHaveBeenCalledWith(
			translations.SETTINGS.GENERAL.UNSUPPORTED_CURRENCY.replace("{{currency}}", "VND").replace(
				"{{provider}}",
				"CryptoCompare",
			),
		);

		expect(getSelectInput("CURRENCY")).toHaveValue("USD ($)");

		toastSpy.mockRestore();
	});

	it("should show confirmation modal when auto logoff field is changed", async () => {
		const settingsURL = `/profiles/${profile.id()}/settings`;

		profile.flushSettings();

		const history = createHashHistory();
		history.push(settingsURL);

		render(
			<Route path="/profiles/:profileId/settings">
				<GeneralSettings />
			</Route>,
			{
				history,
				route: `/profiles/${profile.id()}/settings`,
			},
		);

		await waitFor(() => expect(nameInput()).toHaveValue(profile.name()));

		// change auto signout period
		expect(within(autoSignout()).getByTestId("select-list__input")).toHaveValue("15");

		await userEvent.click(within(autoSignout()).getByTestId("SelectDropdown__caret"));

		const firstOption = within(autoSignout()).getByTestId("SelectDropdown__option--0");

		expect(firstOption).toBeInTheDocument();

		await userEvent.click(firstOption);

		expect(within(autoSignout()).getByTestId("select-list__input")).toHaveValue("1");

		// change navigation
		history.push(`/profiles/${profile.id()}/dashboard`);

		await waitFor(() => expect(history.location.pathname).toBe(settingsURL));
	});
});
