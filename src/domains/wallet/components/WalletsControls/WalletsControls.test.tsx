import React from "react";

import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { Route } from "react-router-dom";
import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { render, screen, getDefaultProfileId, renderResponsiveWithRoute, waitFor } from "@/utils/testing-library";
const history = createHashHistory();

describe("WalletsControls", () => {
	const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;

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

	beforeAll(() => {
		history.push(dashboardURL);
	});

	it("should render", async () => {
		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={{}} />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("WalletControls")).resolves.toBeVisible();
	});

	it("should render for incompatible ledger wallet", async () => {
		process.env.REACT_APP_IS_UNIT = undefined;

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={{}} />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProviders: true,
			},
		);

		await expect(screen.findByTestId("WalletControls")).resolves.toBeVisible();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", async (breakpoint) => {
		renderResponsiveWithRoute(
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
				withProfileSynchronizer: true,
			},
		);

		await expect(screen.findByTestId("WalletControls")).resolves.toBeVisible();
	});

	it("should execute onCreateWallet callback", async () => {
		const onCreateWallet = vi.fn();

		render(
			<Route path="/profiles/:profileId/dashboard">
				<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={{}} />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProviders: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletControls__create-wallet")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(onCreateWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onCreateWallet callback when responsive", async () => {
		const onCreateWallet = vi.fn();

		render(
			<Route path="/profiles/:profileId/">
				<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={{}} />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("dropdown__toggle")[1]).toBeInTheDocument();
		});

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onCreateWallet).toHaveBeenCalledWith();
	});

	it("should execute onImportWallet callback", async () => {
		const onImportWallet = vi.fn();

		renderResponsiveWithRoute(
			<Route path="/profiles/:profileId/">
				<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />
			</Route>,
			"xs",
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getByTestId("WalletControls__create-wallet")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(onImportWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onImportWallet callback when responsive", async () => {
		const onImportWallet = vi.fn();

		render(
			<Route path="/profiles/:profileId/">
				<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />
			</Route>,
			{
				history,
				route: dashboardURL,
				withProfileSynchronizer: true,
			},
		);

		await waitFor(() => {
			expect(screen.getAllByTestId("dropdown__toggle")[1]).toBeInTheDocument();
		});

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(onImportWallet).toHaveBeenCalledWith();
	});

	it("should render with networks selection", () => {
		const { container } = render(
			<WalletsControls
				onCreateWallet={vi.fn()}
				onImportWallet={vi.fn()}
				filterProperties={filterProperties as any}
			/>,
			{
				history,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toMatchSnapshot();
	});
});
