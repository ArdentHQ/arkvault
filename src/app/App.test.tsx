import { Environment } from "@/app/lib/profiles";
import React from "react";
import { App } from "./App";
import { toasts } from "@/app/services";
import { translations as errorTranslations } from "@/domains/error/i18n";
import { translations as profileTranslations } from "@/domains/profile/i18n";
import * as themeUtils from "@/utils/theme";
import { env, render, renderWithoutRouter, screen, waitFor } from "@/utils/testing-library";

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

describe("App", () => {
	beforeAll(async () => {
		vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());

		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";
	});

	afterAll(() => {
		vi.restoreAllMocks();
		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	beforeEach(() => {
		env.reset();
	});

	it("should render page skeleton", async () => {
		const toastSuccessMock = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		process.env.REACT_APP_IS_UNIT = "1";
		process.env.REACT_APP_IS_E2E = undefined;

		renderWithoutRouter(<App />);

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		toastSuccessMock.mockRestore();
	});

	it("should render profile rows in welcome screen", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		renderWithoutRouter(<App />);

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		await expect(
			screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined),
		).resolves.toBeVisible();
	});

	it("should close page skeleton if not e2e", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		const { container } = renderWithoutRouter(<App />);

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());

		expect(container).toBeInTheDocument();
	});

	it("should renderWithoutRouter welcome screen after page skeleton", async () => {
		process.env.REACT_APP_IS_E2E = "1";

		renderWithoutRouter(<App />);

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
	});
	//
	it("should render the offline screen if there is no internet connection", async () => {
		process.env.REACT_APP_IS_UNIT = "1";

		vi.spyOn(window.navigator, "onLine", "get").mockReturnValueOnce(false);

		renderWithoutRouter(<App />);

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

		render(<App />);

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

		renderWithoutRouter(<App />);

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
		await expect(screen.findByText("Foo Bar")).resolves.toBeVisible();
	});

	it("should not migrate profiles", async () => {
		process.env.REACT_APP_IS_E2E = undefined;

		renderWithoutRouter(<App />);

		expect(screen.getByTestId("PageSkeleton")).toBeInTheDocument();

		await expect(screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE)).resolves.toBeVisible();
	});

	it.each([false, true])(
		"should set the theme based on system preferences (dark = %s)",
		async (shouldUseDarkColors) => {
			const getItemSpy = vi.spyOn(Storage.prototype, "getItem").mockReturnValue(null);
			Object.defineProperty(window, "matchMedia", {
				value: vi.fn().mockImplementation(() => ({
					matches: shouldUseDarkColors,
				})),
			});

			process.env.REACT_APP_IS_UNIT = "1";

			const toastSpy = vi.spyOn(toasts, "dismiss").mockResolvedValue(undefined);
			const utilsSpy = vi.spyOn(themeUtils, "shouldUseDarkColors").mockReturnValue(shouldUseDarkColors);

			renderWithoutRouter(<App />);

			await expect(
				screen.findByText(profileTranslations.PAGE_WELCOME.WITH_PROFILES.TITLE, undefined, { timeout: 2000 }),
			).resolves.toBeVisible();

			// eslint-disable-next-line testing-library/no-node-access
			expect(document.querySelector("html")).toHaveClass(shouldUseDarkColors ? "dark" : "light");

			toastSpy.mockRestore();
			utilsSpy.mockRestore();
			getItemSpy.mockRestore();
		},
	);
});
