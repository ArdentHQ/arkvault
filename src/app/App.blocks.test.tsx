/* eslint-disable @typescript-eslint/require-await */
import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { Route, useHistory, Prompt } from "react-router-dom";
import { AppRouter, Main } from "./App.blocks";
import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
	within,
	act,
} from "@/utils/testing-library";
import { toasts } from "@/app/services";
import * as useProfileSynchronizerHook from "@/app/hooks/use-profile-synchronizer";
const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

vi.mock("@/domains/news/routing", async () => {
	const page = await vi.importActual("@/domains/news/pages/News");
	const { ProfilePaths } = await vi.importActual("@/router/paths");

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

		await waitFor(() => {
			expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
			expect(screen.queryByTestId("prompt_action")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("prompt_action"));

		await waitFor(() => {
			expect(screen.queryByTestId("ConfirmationModal__yes-button")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("ConfirmationModal__yes-button"));

		await waitFor(() => {
			expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
		});
	});
});

describe("App Main", () => {
	beforeEach(() => {
		history.push("/");
		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";
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
		const dismissToastSpy = vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());
		const profileUrl = `/profiles/${getDefaultProfileId()}/news`;

		const profile = env.profiles().first();
		const resetProfileNetworksMock = mockProfileWithPublicAndTestNetworks(profile);

		await env.profiles().restore(profile);

		const walletSyncErrorMock = vi.spyOn(profile.wallets().first(), "hasSyncedWithNetwork").mockReturnValue(false);
		const walletRestoreErrorMock = vi
			.spyOn(profile.wallets().last(), "hasBeenFullyRestored")
			.mockReturnValue(false);

		const profileSyncMock = vi.spyOn(profile, "sync").mockImplementation(() => {
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
		resetProfileNetworksMock();
	});

	it("should enter profile and sync", async () => {
		const successToastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		const warningToastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const dismissToastSpy = vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());

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

		vi.spyOn(useProfileSynchronizerHook, "useProfileSynchronizer").mockImplementation((parameters: any) => {
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
});
