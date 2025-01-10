/* eslint-disable @typescript-eslint/require-await */
import { createHashHistory } from "history";
import React from "react";
import userEvent from "@testing-library/user-event";
import { Route, useHistory, Prompt } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { AppRouter, Main } from "./App.blocks";
import {
	env,
	getDefaultProfileId,
	mockProfileWithPublicAndTestNetworks,
	render,
	screen,
	waitFor,
	act,
} from "@/utils/testing-library";
import { toasts } from "@/app/services";
import * as useProfileSynchronizerHook from "@/app/hooks/use-profile-synchronizer";
import { ApplicationError } from "@/domains/error/pages";
const history = createHashHistory();

vi.mock("@/utils/delay", () => ({
	delay: (callback: () => void) => callback(),
}));

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
		process.env.REACT_APP_IS_UNIT = undefined;
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

		act(() => {
			history.push(`/profiles/${getDefaultProfileId()}/prompt`);
		})

		await userEvent.click(screen.getByTestId("prompt_action"));
		expect(screen.getByTestId("ConfirmationModal")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ConfirmationModal__no-button"));

		expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
		expect(screen.getByTestId("prompt_action")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("prompt_action"));
		expect(screen.getByTestId("ConfirmationModal__yes-button")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("ConfirmationModal__yes-button"));
		expect(screen.queryByTestId("ConfirmationModal")).not.toBeInTheDocument();
	});
});

const renderComponent = (path = "/", options = {}) => {
	render(
		<ErrorBoundary FallbackComponent={ApplicationError}>
			<Route path={path}>
				<Main />
			</Route>
		</ErrorBoundary>,
		{
			history,
			route: "/",
			withProviders: true,
			...options,
		},
	);
};

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
		renderComponent();

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();

		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());
	});

	it("should fail to sync", async () => {
		const dismissToastSpy = vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());
		const warningToastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const profileUrl = `/profiles/${getDefaultProfileId()}/exchange`;

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

		renderComponent("/profiles/:profileId/exchange", { route: profileUrl });

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));

		await waitFor(() => expect(dismissToastSpy).toHaveBeenCalled());
		await waitFor(() => expect(warningToastSpy).toHaveBeenCalled());

		dismissToastSpy.mockRestore();
		warningToastSpy.mockRestore();
		resetProfileNetworksMock();
		walletSyncErrorMock.mockRestore();
		walletRestoreErrorMock.mockRestore();
		profileSyncMock.mockRestore();
	});

	it("should enter profile and sync", async () => {
		const successToastSpy = vi.spyOn(toasts, "success").mockImplementation(vi.fn());
		const warningToastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());
		const dismissToastSpy = vi.spyOn(toasts, "dismiss").mockImplementation(vi.fn());

		const profileUrl = `/profiles/${getDefaultProfileId()}/exchange`;
		history.push(profileUrl);

		renderComponent("/profiles/:profileId/exchange", { route: profileUrl });

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));
		await waitFor(() => expect(successToastSpy).toHaveBeenCalled());

		successToastSpy.mockRestore();
		warningToastSpy.mockRestore();
		dismissToastSpy.mockRestore();
	});

	it("should show warning toast when profile has ledger wallets in an incompatible browser", async () => {
		const profile = env.profiles().findById(getDefaultProfileId());

		const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "FwW39QnQvQRQJF2MCfAoKvsX4DJ28jq",
			coin: "ARK",
			network: "ark.devnet",
			path: "m/44'/1'/0'/0/3",
		});

		profile.wallets().push(wallet);

		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;

		const restoredMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		const warningToastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const profileUrl = `/profiles/${getDefaultProfileId()}/exchange`;
		history.push(profileUrl);

		renderComponent("/profiles/:profileId/exchange", { route: profileUrl });

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));
		await waitFor(() => expect(warningToastSpy).toHaveBeenCalled());

		profile.wallets().forget(wallet.id());

		restoredMock.mockRestore();
		warningToastSpy.mockRestore();
	});

	it("should redirect to login page if profile changes", async () => {
		let onProfileUpdated: () => void;
		const { useProfileSynchronizer } = useProfileSynchronizerHook;

		vi.spyOn(useProfileSynchronizerHook, "useProfileSynchronizer").mockImplementation((parameters: any) => {
			onProfileUpdated = parameters.onProfileUpdated as () => void;
			return useProfileSynchronizer(useProfileSynchronizer);
		});

		const profileUrl = `/profiles/${getDefaultProfileId()}/exchange`;

		history.push(profileUrl);

		renderComponent(profileUrl, { route: profileUrl });

		await waitFor(() => expect(history.location.pathname).toBe(profileUrl));

		act(() => {
			onProfileUpdated();
		})

		await waitFor(() => expect(history.location.pathname).toBe("/"));
	});
});
