import React from "react";

import userEvent from "@testing-library/user-event";
import { createHashHistory } from "history";
import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { getDefaultProfileId, render, renderResponsiveWithRoute, screen } from "@/utils/testing-library";
import { Route } from "react-router-dom";

const dashboardURL = `/profiles/${getDefaultProfileId()}/dashboard`;
const history = createHashHistory();

describe("WalletsControls", () => {
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
});
