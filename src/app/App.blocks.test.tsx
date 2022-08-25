/* eslint-disable @typescript-eslint/require-await */
import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { Route, useHistory, Prompt } from "react-router-dom";
import { AppRouter, Main } from "./App.blocks";
import { getDefaultProfileId, render, screen, waitFor, within, env, defaultNetMocks } from "@/utils/testing-library";
import { toasts } from "@/app/services";
import * as useProfileSynchronizerHook from "@/app/hooks/use-profile-synchronizer";
import { translations } from "@/app/i18n/common/i18n";

const history = createHashHistory();

jest.setTimeout(7000);

jest.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

jest.mock("@/domains/news/routing", () => {
	const page = require("@/domains/news/pages/News");
	const { ProfilePaths } = require("@/router/paths");

	return {
		NewsRoutes: [
			{
				component: page.default,
				exact: true,
				path: ProfilePaths.News,
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

describe("App Router", () => {
	beforeEach(() => {
		history.push("/");
	});

	it("should render app router", async () => {
		const { asFragment } = render(<AppRouter />, {
			history,
			withProviders: true,
		});

		expect(asFragment()).toMatchSnapshot();
	});

	it("should handle user confirmation modal", async () => {
		const PromptComponent = () => {
			const history = useHistory();
			const goToRoot = () => history.push("/");

			return (
				<>
					<div data-testid="prompt_action" onClick={goToRoot} />
					<Prompt message={"prompt message"} when={true} />
				</>
			);
		};

		render(
			<AppRouter>
				<PromptComponent />
			</AppRouter>,
			{
				history,
				withProviders: true,
			},
		);

		expect(history.location.pathname).toBe("/");

		await waitFor(() => {
			expect(screen.getByTestId("prompt_action")).toBeInTheDocument();
		});

		history.push(`/profiles/${getDefaultProfileId()}/prompt`);

		userEvent.click(screen.getByTestId("prompt_action"));

		await waitFor(() => {
			expect(screen.getByTestId("ConfirmationModal")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ConfirmationModal__no-button"));

		expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
		expect(screen.getByTestId("prompt_action")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("prompt_action"));
		userEvent.click(screen.getByTestId("ConfirmationModal__yes-button"));

		expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
	});
});

describe("App Main", () => {
	beforeEach(() => {
		history.push("/");
		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";
		defaultNetMocks();
	});

	afterAll(() => {
		process.env.MOCK_SYNCHRONIZER = undefined;
	});

	it("should render", async () => {
		render(
			<Route path="/">
				<Main />
			</Route>,
			{
				history,
				route: "/",
				withProviders: true,
			},
		);

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());
	});

	it("should fail to sync and retry", async () => {
		const dismissToastSpy = jest.spyOn(toasts, "dismiss").mockImplementation();
		const profileUrl = `/profiles/${getDefaultProfileId()}/news`;

		const profile = env.profiles().first();
		await env.profiles().restore(profile);

		const walletSyncErrorMock = jest
			.spyOn(profile.wallets().first(), "hasSyncedWithNetwork")
			.mockReturnValue(false);
		const walletRestoreErrorMock = jest
			.spyOn(profile.wallets().last(), "hasBeenFullyRestored")
			.mockReturnValue(false);

		const profileSyncMock = jest.spyOn(profile, "sync").mockImplementation(() => {
			throw new Error("sync test");
		});

		render(
			<Route path="/profiles/:profileId/news">
				<Main />
			</Route>,
			{
				history,
				route: profileUrl,
				withProviders: true,
			},
		);

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));

		await waitFor(() => {
			expect(screen.getByTestId("SyncErrorMessage__retry")).toBeInTheDocument();
		});

		profileSyncMock.mockRestore();
		walletRestoreErrorMock.mockRestore();
		walletSyncErrorMock.mockRestore();

		userEvent.click(within(screen.getByTestId("SyncErrorMessage__retry")).getByRole("link"));

		await waitFor(() => expect(dismissToastSpy).toHaveBeenCalledWith());

		dismissToastSpy.mockRestore();
	});

	it("should enter profile and sync", async () => {
		const successToastSpy = jest.spyOn(toasts, "success").mockImplementation(jest.fn());
		const warningToastSpy = jest.spyOn(toasts, "warning").mockImplementation(jest.fn());
		const dismissToastSpy = jest.spyOn(toasts, "dismiss").mockImplementation(jest.fn());

		const profileUrl = `/profiles/${getDefaultProfileId()}/news`;
		history.push(profileUrl);

		render(
			<Route path="/profiles/:profileId/news">
				<Main />
			</Route>,
			{
				history,
				route: profileUrl,
				withProviders: true,
			},
		);

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));

		successToastSpy.mockRestore();
		warningToastSpy.mockRestore();
		dismissToastSpy.mockRestore();
	});

	it("should redirect to login page if profile changes", async () => {
		let onProfileUpdated: () => void;
		const { useProfileSynchronizer } = useProfileSynchronizerHook;

		jest.spyOn(useProfileSynchronizerHook, "useProfileSynchronizer").mockImplementation((parameters: any) => {
			onProfileUpdated = parameters.onProfileUpdated as () => void;
			return useProfileSynchronizer(useProfileSynchronizer);
		});

		const profileUrl = `/profiles/${getDefaultProfileId()}/news`;
		history.push(profileUrl);

		render(
			<Route path={profileUrl}>
				<Main />
			</Route>,
			{
				history,
				route: profileUrl,
				withProviders: true,
			},
		);

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));

		onProfileUpdated();

		await waitFor(() => expect(history.location.pathname).toBe("/"));
	});

	describe("useDeeplink", () => {
		const mainnetDeepLink =
			"/?method=transfer&coin=ark&network=ark.mainnet&recipient=DNjuJEDQkhrJ7cA9FZ2iVXt5anYiM8Jtc9&amount=1.2&memo=ARK";
		let toastWarningSpy: jest.SpyInstance;

		beforeEach(() => {
			toastWarningSpy = jest.spyOn(toasts, "warning").mockImplementation();
		});

		afterEach(() => {
			toastWarningSpy.mockRestore();
		});

		it("should prompt the user to select a profile", async () => {
			render(
				<Route path="/">
					<Main />
				</Route>,
				{
					history,
					route: mainnetDeepLink,
					withProviders: true,
				},
			);

			await waitFor(() =>
				expect(toastWarningSpy).toHaveBeenCalledWith(translations.SELECT_A_PROFILE, { delay: 500 }),
			);
		});
	});
});
