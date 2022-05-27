/* eslint-disable @typescript-eslint/require-await */
import { Bcrypt } from "@payvo/sdk-cryptography";
import { Contracts, Environment } from "@payvo/sdk-profiles";
import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { toasts } from "@/app/services";
import { translations as errorTranslations } from "@/domains/error/i18n";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import * as themeUtils from "@/utils/theme";
import {
	env,
	getDefaultPassword,
	getPasswordProtectedProfileId,
	render,
	screen,
	waitFor,
} from "@/utils/testing-library";

jest.mock("@/domains/dashboard/routing", () => {
	const page = require("@/domains/dashboard/pages/Dashboard");
	const { ProfilePaths } = require("@/router/paths");

	return {
		DashboardRoutes: [
			{
				component: page.default,
				exact: true,
				path: ProfilePaths.Dashboard,
			},
		],
	};
});

jest.mock("@/domains/profile/routing", () => {
	const page = require("@/domains/profile/pages/Welcome");
	const { ProfilePaths } = require("@/router/paths");

	return {
		ProfileRoutes: [
			{
				component: page.default,
				exact: true,
				path: ProfilePaths.Welcome,
			},
		],
	};
});

let passwordProtectedProfile: Contracts.IProfile;
const history = createHashHistory();

const passwordInput = () => screen.getByTestId("SignIn__input--password");

describe("App", () => {
	beforeAll(async () => {
		passwordProtectedProfile = env.profiles().findById(getPasswordProtectedProfileId());

		jest.spyOn(toasts, "dismiss").mockImplementation(jest.fn());

		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";
	});

	afterAll(() => {
		jest.restoreAllMocks();
		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	beforeEach(() => {
		history.replace("/");
		env.reset();
	});

	it("should render splash screen", async () => {
		const toastSuccessMock = jest.spyOn(toasts, "success").mockImplementation(jest.fn());
		process.env.REACT_APP_IS_UNIT = "1";
		process.env.REACT_APP_IS_E2E = undefined;

		const { asFragment } = render(<App />, {
			history,
			withProviders: false,
		});

		expect(screen.getByTestId("Splash__text")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("Splash__text")).not.toBeInTheDocument());

		expect(asFragment()).toMatchSnapshot();

		toastSuccessMock.mockRestore();
	});

	it("should render profile cards in welcome screen", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, {
			history,
			withProviders: false,
		});

		expect(screen.getByTestId("Splash__text")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("Splash__text")).not.toBeInTheDocument());

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();
	});

	it("should close splash screen if not e2e", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const { container, asFragment } = render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("Splash__text")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("Splash__text")).not.toBeInTheDocument());

		expect(container).toBeInTheDocument();
		expect(asFragment()).toMatchSnapshot();
	});

	it("should render welcome screen after splash screen", async () => {
		process.env.REACT_APP_IS_E2E = "1";

		const { asFragment } = render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("Splash__text")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should render the offline screen if there is no internet connection", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		jest.spyOn(window.navigator, "onLine", "get").mockReturnValueOnce(false);

		const { asFragment } = render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("Splash__text")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId("Offline__text")).toHaveTextContent(errorTranslations.OFFLINE.TITLE);
		});

		expect(screen.getByTestId("Offline__text")).toHaveTextContent(errorTranslations.OFFLINE.DESCRIPTION);
		expect(asFragment()).toMatchSnapshot();
	});

	it("should show the beta notice if the localstorage flag is not set", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const { asFragment } = render(<App />, { history, withProviders: false });

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();
		await expect(screen.findByText("Payvo Beta Testing")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should close the beta notice on continue", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		jest.spyOn(Storage.prototype, "getItem").mockReturnValueOnce(undefined);

		const localstorageSpy = jest.spyOn(Storage.prototype, "setItem");

		render(<App />, { history, withProviders: false });

		await expect(screen.findByTestId("Modal__inner")).resolves.toBeVisible();

		userEvent.click(screen.getByTestId("BetaNoticeModal__agree"));
		userEvent.click(screen.getByTestId("BetaNoticeModal__submit-button"));

		expect(screen.queryByTestId("Modal__inner")).not.toBeInTheDocument();

		expect(localstorageSpy).toHaveBeenCalledWith("hideBetaNotice", "true");

		localstorageSpy.mockRestore();
	});

	it("should render application error if the app fails to boot", async () => {
		const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {});

		const environmentSpy = jest.spyOn(Environment.prototype, "boot").mockImplementation(() => {
			throw new Error("failed to boot env");
		});

		process.env.REACT_APP_IS_UNIT = "1";

		const { asFragment } = render(<App />, { history });

		await waitFor(() => expect(environmentSpy).toHaveBeenCalledWith());

		await waitFor(() => {
			expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(errorTranslations.APPLICATION.TITLE);
		});

		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(
			errorTranslations.APPLICATION.DESCRIPTION,
		);
		expect(asFragment()).toMatchSnapshot();

		consoleSpy.mockRestore();
		environmentSpy.mockRestore();
	});

	it("should render mock", async () => {
		process.env.REACT_APP_IS_E2E = "1";

		const { asFragment } = render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("Splash__text")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
		await expect(screen.findByText("John Doe")).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should not migrate profiles", async () => {
		process.env.REACT_APP_IS_E2E = undefined;

		const { asFragment } = render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("Splash__text")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();

		expect(asFragment()).toMatchSnapshot();
	});

	it("should redirect to root if profile restoration error occurs", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, { history, withProviders: false });

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();

		expect(history.location.pathname).toBe("/");

		userEvent.click(screen.getAllByTestId("Card")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		userEvent.type(passwordInput(), "password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("password");
		});

		const verifyPasswordMock = jest.spyOn(Bcrypt, "verify").mockReturnValue(true);
		const memoryPasswordMock = jest.spyOn(env.profiles().last().password(), "get").mockImplementation(() => {
			throw new Error("password not found");
		});

		userEvent.click(screen.getByTestId("SignIn__submit-button"));

		await waitFor(() => expect(memoryPasswordMock).toHaveBeenCalledTimes(1), { timeout: 4000 });
		await waitFor(() => expect(history.location.pathname).toBe("/"));

		memoryPasswordMock.mockRestore();
		verifyPasswordMock.mockRestore();
	});

	it.each([false, true])(
		"should set the theme based on system preferences (dark = %s)",
		async (shouldUseDarkColors) => {
			Object.defineProperty(window, "matchMedia", {
				value: jest.fn().mockImplementation(() => ({
					matches: shouldUseDarkColors,
				})),
			});

			process.env.REACT_APP_IS_UNIT = "1";

			const toastSpy = jest.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
			const utilsSpy = jest.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(shouldUseDarkColors);

			render(<App />, { history, withProviders: false });

			await expect(
				screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined, { timeout: 2000 }),
			).resolves.toBeVisible();

			expect(document.body).toHaveClass(shouldUseDarkColors ? "dark" : "light");

			toastSpy.mockRestore();
			utilsSpy.mockRestore();
		},
	);

	it("should enter profile", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, { history, withProviders: false });

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();

		await env.profiles().restore(passwordProtectedProfile, getDefaultPassword());

		expect(history.location.pathname).toBe("/");

		userEvent.click(screen.getAllByTestId("Card")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		userEvent.type(passwordInput(), "password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("password");
		});

		jest.spyOn(toasts, "dismiss").mockResolvedValue(undefined);

		userEvent.click(screen.getByTestId("SignIn__submit-button"));

		const profileDashboardUrl = `/profiles/${passwordProtectedProfile.id()}/dashboard`;
		await waitFor(() => expect(history.location.pathname).toBe(profileDashboardUrl), { timeout: 4000 });

		jest.restoreAllMocks();
	});

	it("should enter profile and fail to restore", async () => {
		process.env.REACT_APP_IS_UNIT = "1";
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;

		render(<App />, { history, withProviders: false });

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();

		await env.profiles().restore(passwordProtectedProfile, getDefaultPassword());

		expect(history.location.pathname).toBe("/");

		userEvent.click(screen.getAllByTestId("Card")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		userEvent.type(passwordInput(), "password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("password");
		});

		jest.spyOn(toasts, "dismiss").mockResolvedValue(undefined);

		jest.spyOn(passwordProtectedProfile.password(), "get").mockImplementation(() => {
			throw new Error("restore error");
		});

		userEvent.click(screen.getByTestId("SignIn__submit-button"));

		await waitFor(() => expect(history.location.pathname).toBe("/"), { timeout: 4000 });

		jest.restoreAllMocks();
	});
});
