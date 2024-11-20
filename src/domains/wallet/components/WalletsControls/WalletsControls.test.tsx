import React from "react";
import { Contracts } from "@ardenthq/sdk-profiles";
import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { env, getDefaultProfileId, render, renderResponsiveWithRoute, screen } from "@/utils/testing-library";
import { Route } from "react-router-dom";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("WalletsControls", () => {
	let profile: Contracts.IProfile;
	const filterProperties: FilterWalletsHookProperties = {
		defaultConfiguration: {
			selectedNetworkIds: [],
			walletsDisplayType: "all",
		},
		disabled: false,
		isFilterChanged: false,
		networks: [],
		selectedNetworkIds: [],
		update: vi.fn(),
		walletsDisplayType: "all",
	};

	beforeAll(async () => {
		profile = env.profiles().findById(getDefaultProfileId());
		await env.profiles().restore(profile);
		await profile.sync();
	});

	it("should render", () => {
		const { container } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={vi.fn()}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties}
				/>
			</Route>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render for incompatible ledger wallet", () => {
		process.env.REACT_APP_IS_UNIT = undefined;

		const { container } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={vi.fn()}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties}
				/>
			</Route>,
			{
				route: dashboardURL,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={vi.fn()}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties}
				/>
			</Route>,
			breakpoint,
			{
				history,
				route: dashboardURL,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it("should execute onCreateWallet callback", async () => {
		const onCreateWallet = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={{}} />
			</Route>,
			{
				route: dashboardURL,
			},
		);

		await userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(onCreateWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onCreateWallet callback when responsive", async () => {
		const onCreateWallet = vi.fn();

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={onCreateWallet}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties}
				/>
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		// Await for multiple dropdown toggles to be available
		await expect(screen.findAllByTestId("dropdown__toggle")).resolves.toHaveLength(2);

		// Open the dropdown content
		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await expect(screen.findAllByTestId("dropdown__option--0")).resolves.toHaveLength(1);

		await userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onCreateWallet).toHaveBeenCalled();
	});

	it("should execute onImportWallet callback", async () => {
		const onImportWallet = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />
			</Route>,
			{
				route: dashboardURL,
			},
		);

		await userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(onImportWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onImportWallet callback when responsive", async () => {
		const onImportWallet = vi.fn();

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
			},
		);

		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(onImportWallet).toHaveBeenCalledWith();
	});

	it("should render with networks selection", () => {
		const { container } = render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={vi.fn()}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties as any}
				/>
			</Route>,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render tooltip with no content if the Ledger is supported and has at least one network", async () => {
		const availableNetworks = profile
			.wallets()
			.values()
			.map((wallet) => wallet.network());
		process.env.REACT_APP_IS_UNIT = "true";
		const networkSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(availableNetworks);
		const ledgerSpy = vi.spyOn(availableNetworks.at(0), "allows").mockReturnValue(true);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={vi.fn()}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties as any}
				/>
			</Route>,
			{
				route: dashboardURL,
			},
		);

		await userEvent.hover(screen.getByTestId("WalletControls__import-ledger"));

		expect(
			screen.queryByText("ARK Vault requires the use of a chromium based browser when using a Ledger."),
		).not.toBeInTheDocument();
		expect(screen.queryByText("Ledger is not yet supported on this network.")).not.toBeInTheDocument();

		//expect class tippy-content not to be present
		expect(screen.queryByTestId("tippy-content")).not.toBeInTheDocument();

		networkSpy.mockRestore();
		ledgerSpy.mockRestore();
	});

	it("should render tooltip if it has no Ledger network", async () => {
		const availableNetworks = profile
			.wallets()
			.values()
			.map((wallet) => wallet.network());

		process.env.REACT_APP_IS_UNIT = "true";
		const networkSpy = vi.spyOn(profile, "availableNetworks").mockReturnValue(availableNetworks);
		const ledgerSpy = vi.spyOn(availableNetworks.at(0), "allows").mockReturnValue(false);

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls
					onCreateWallet={vi.fn()}
					onImportWallet={vi.fn()}
					filterProperties={filterProperties as any}
				/>
			</Route>,
			{
				route: dashboardURL,
			},
		);

		await userEvent.hover(screen.getByTestId("WalletControls__import-ledger"));

		expect(
			screen.queryByText("ARK Vault requires the use of a chromium based browser when using a Ledger."),
		).not.toBeInTheDocument();
		expect(screen.getByText("Ledger is not yet supported on this network.")).toBeInTheDocument();

		networkSpy.mockRestore();
		ledgerSpy.mockRestore();
	});
});
