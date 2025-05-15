/* eslint-disable @typescript-eslint/require-await */
import { Contracts } from "@/app/lib/profiles";
import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { App } from "./App";
import { toasts } from "@/app/services";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import * as themeUtils from "@/utils/theme";
import { env, render, screen, waitFor, getPasswordProtectedProfileId } from "@/utils/testing-library";

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

		expect(history.location.pathname).toBe("/");

		await userEvent.click(screen.getAllByTestId("ProfileRow__Link")[1]);

		await waitFor(() => {
			expect(passwordInput()).toBeInTheDocument();
		});

		await userEvent.type(passwordInput(), "invalid-password");

		await waitFor(() => {
			expect(passwordInput()).toHaveValue("invalid-password");
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
