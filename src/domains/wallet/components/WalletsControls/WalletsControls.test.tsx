import React from "react";

import userEvent from "@testing-library/user-event";
import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { render, renderResponsive, screen, getDefaultProfileId } from "@/utils/testing-library";
import { createHashHistory } from "history";
import { renderResponsiveWithRoute, waitFor } from "../../../../utils/testing-library";
const history = createHashHistory();
import { Route } from "react-router-dom";

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

	it("should render", () => {
		const { container } = render(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
			{
				history,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it("should render for incompatible ledger wallet", async () => {
		process.env.REACT_APP_IS_UNIT = undefined;

		const { container } = render(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
			{
				history,
				withProfileSynchronizer: true,
			},
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { container } = renderResponsiveWithRoute(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
			breakpoint,
			{
				history,
				withProfileSynchronizer: true,
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
				route: dashboardURL,
				history,
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
