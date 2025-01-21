/* eslint-disable @typescript-eslint/require-await */
import { Bcrypt } from "@ardenthq/sdk-cryptography";
import { Contracts, Environment } from "@ardenthq/sdk-profiles";
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

vi.mock("@/domains/dashboard/routing", async () => {
	const page = await vi.importActual("@/domains/dashboard/pages/Dashboard");
	const { ProfilePaths } = await vi.importActual("@/router/paths");

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

vi.mock("@/domains/profile/routing", async () => {
	const page = await vi.importActual("@/domains/profile/pages/Welcome");
	const { ProfilePaths } = await vi.importActual("@/router/paths");

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

		vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());

		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";
	});

	afterAll(() => {
		vi.restoreAllMocks();
		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	beforeEach(() => {
		history.replace("/");
		env.reset();
	});

	it("should redirect to root if profile restoration error occurs", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, { history, withProviders: false });

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();

		expect(history.location.pathname).toBe("/");

		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		await userEvent.clear(passwordInput());
		await userEvent.type(passwordInput(), "password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("password");
		});

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		const verifyPasswordMock = vi.spyOn(Bcrypt, "verify").mockReturnValue(true);
		const memoryPasswordMock = vi.spyOn(profile.password(), "get").mockImplementation(() => {
			throw new Error("password not found");
		});

		await userEvent.click(screen.getByTestId("SignIn__submit-button"));

		await waitFor(() => expect(memoryPasswordMock).toHaveBeenCalled(), { timeout: 4000 });
		await waitFor(() => expect(history.location.pathname).toBe("/"));

		memoryPasswordMock.mockRestore();
		verifyPasswordMock.mockRestore();
	});

	it("should render page skeleton", async () => {
		const toastSuccessMock = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		process.env.REACT_APP_IS_UNIT = "1";
		process.env.REACT_APP_IS_E2E = undefined;

		render(<App />, {
			history,
			withProviders: false,
		});

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		toastSuccessMock.mockRestore();
	});

	it("should render profile rows in welcome screen", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, {
			history,
			withProviders: false,
		});

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();
	});

	it("should close page skeleton if not e2e", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const { container } = render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		expect(container).toBeInTheDocument();
	});

	it("should render welcome screen after page skeleton", async () => {
		process.env.REACT_APP_IS_E2E = "1";

		render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
	});

	it("should render the offline screen if there is no internet connection", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		vi.spyOn(window.navigator, "onLine", "get").mockReturnValueOnce(false);

		render(<App />, { history, withProviders: false });

		await waitFor(() => {
			expect(screen.getByTestId("Offline__text")).toHaveTextContent(errorTranslations.OFFLINE.TITLE);
		});

		expect(screen.getByTestId("Offline__text")).toHaveTextContent(errorTranslations.OFFLINE.DESCRIPTION);
	});

	it("should render application error if the app fails to boot", async () => {
		const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

		const environmentSpy = vi.spyOn(Environment.prototype, "boot").mockImplementation(() => {
			throw new Error("failed to boot env");
		});

		process.env.REACT_APP_IS_UNIT = "1";

		render(<App />, { history });

		await waitFor(() => expect(environmentSpy).toHaveBeenCalledWith());

		await waitFor(() => {
			expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(errorTranslations.APPLICATION.TITLE);
		});

		expect(screen.getByTestId("ApplicationError__text")).toHaveTextContent(
			errorTranslations.APPLICATION.DESCRIPTION,
		);

		consoleSpy.mockRestore();
		environmentSpy.mockRestore();
	});

	it("should render mock", async () => {
		process.env.REACT_APP_IS_E2E = "1";

		render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
		await expect(screen.findByText("John Doe")).resolves.toBeVisible();
	});

	it("should not migrate profiles", async () => {
		process.env.REACT_APP_IS_E2E = undefined;

		render(<App />, { history, withProviders: false });

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
	});

	it.each([false, true])(
		"should set the theme based on system preferences (dark = %s)",
		async (shouldUseDarkColors) => {
			Object.defineProperty(window, "matchMedia", {
				value: vi.fn().mockImplementation(() => ({
					matches: shouldUseDarkColors,
				})),
			});

			process.env.REACT_APP_IS_UNIT = "1";

			const toastSpy = vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
			const utilsSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(shouldUseDarkColors);

			render(<App />, { history, withProviders: false });

			await expect(
				screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined, { timeout: 2000 }),
			).resolves.toBeVisible();

			// eslint-disable-next-line testing-library/no-node-access
			expect(document.querySelector("html")).toHaveClass(shouldUseDarkColors ? "dark" : "light");

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

		expect(history.location.pathname).toBe("/");

		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		await userEvent.type(passwordInput(), "password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("password");
		});

		const toastSpy = vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);

		await userEvent.click(screen.getByTestId("SignIn__submit-button"));

		const profileDashboardUrl = `/profiles/${passwordProtectedProfile.id()}/dashboard`;
		await waitFor(() => expect(history.location.pathname).toBe(profileDashboardUrl), { timeout: 4000 });

		toastSpy.mockRestore();
	});

	it("should enter profile and fail to restore", async () => {
		process.env.REACT_APP_IS_UNIT = "1";
		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;

		render(<App />, { history, withProviders: false });

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined, { timeout: 2000 }),
		).resolves.toBeVisible();

		const profile = env.profiles().findById("cba050f1-880f-45f0-9af9-cfe48f406052");

		vi.spyOn(profile, "usesPassword").mockReturnValue(true);
		vi.spyOn(profile.password(), "get").mockImplementation(() => {
			throw new Error("Failed to restore");
		});

		await env.profiles().restore(passwordProtectedProfile, getDefaultPassword());

		expect(history.location.pathname).toBe("/");

		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		await userEvent.type(passwordInput(), "password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("password");
		});

		const toastSpy = vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);

		vi.spyOn(passwordProtectedProfile.password(), "get").mockImplementation(() => {
			throw new Error("restore error");
		});

		await userEvent.click(screen.getByTestId("SignIn__submit-button"));

		await waitFor(() => expect(history.location.pathname).toBe("/"), { timeout: 4000 });

		toastSpy.mockRestore();
		vi.restoreAllMocks();
	});
});
