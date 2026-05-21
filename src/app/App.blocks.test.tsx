import React from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Main } from "./App.blocks";
import { env, getMainsailProfileId, render, screen, waitFor, act } from "@/utils/testing-library";
import { toasts } from "@/app/services";
import * as useProfileSynchronizerHook from "@/app/hooks/use-profile-synchronizer";
import { ApplicationError } from "@/domains/error/pages";
import { ExchangeProvider } from "@/domains/exchange/contexts/Exchange";
import * as PanelsMock from "./Panels.blocks";

let appPanelsMock;

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
	});

	it("should render app router", async () => {
		const { asFragment } = render(<div />, {
			withProviders: true,
		});

		expect(asFragment()).toMatchSnapshot();
	});
});

const renderComponent = (path = "/", options = {}) =>
	render(
		<ErrorBoundary FallbackComponent={ApplicationError}>
			<ExchangeProvider>
				<Main />
			</ExchangeProvider>
		</ErrorBoundary>,
		{
			route: path ?? "/",
			withProviders: true,
			...options,
		},
	);

describe("App Main", () => {
	beforeAll(() => {
		appPanelsMock = vi.spyOn(PanelsMock, "AppPanels").mockImplementation(() => <></>);
	});

	beforeEach(() => {
		// Mock synchronizer to avoid running any jobs in these tests.
		process.env.MOCK_SYNCHRONIZER = "TRUE";
	});

	afterAll(() => {
		process.env.MOCK_SYNCHRONIZER = undefined;
		appPanelsMock.mockRestore();
	});

	it("should render", async () => {
		renderComponent();

		expect(screen.getByTestId("PageSkeleton")).toBeVisible();
		await waitFor(() => expect(screen.queryByTestId("PageSkeleton")).not.toBeInTheDocument());
	});

	it("should show warning toast when profile has ledger wallets in an incompatible browser", async () => {
		const profile = env.profiles().findById(getMainsailProfileId());

		const wallet = await profile.walletFactory().fromAddressWithDerivationPath({
			address: "0x393f3F74F0cd9e790B5192789F31E0A38159ae03",
			coin: "Mainsail",
			network: "mainsail.devnet",
			path: "m/44'/1'/0'/0/3",
		});

		profile.wallets().push(wallet);

		process.env.TEST_PROFILES_RESTORE_STATUS = undefined;

		const restoredMock = vi.spyOn(profile.status(), "isRestored").mockReturnValue(false);
		const warningToastSpy = vi.spyOn(toasts, "warning").mockImplementation(vi.fn());

		const profileUrl = `/profiles/${getMainsailProfileId()}/exchange`;

		const { router } = renderComponent("/profiles/:profileId/exchange", { route: profileUrl });

		await waitFor(() => expect(router.state.location.pathname).toBe(profileUrl));
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

		const profileUrl = `/profiles/${getMainsailProfileId()}/exchange`;
		const { router } = renderComponent(profileUrl, { route: profileUrl });

		await waitFor(() => expect(router.state.location.pathname).toBe(profileUrl));

		act(() => {
			onProfileUpdated();
		});

		await waitFor(() =>
			expect(router.state.location.pathname).toBe(`/profiles/${getMainsailProfileId()}/dashboard`),
		);
	});
});
