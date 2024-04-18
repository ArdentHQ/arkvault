import React from "react";

import userEvent from "@testing-library/user-event";
import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { render, renderResponsive, screen, getDefaultProfileId } from "@/utils/testing-library";
import { createHashHistory } from "history";
import { renderResponsiveWithRoute, waitFor } from "../../../../utils/testing-library";
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

		render(<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={{}} />, {
			history,
			withProviders: true,
			withProfileSynchronizer: true,
		});

		await waitFor(() => {
			expect(screen.getByTestId("WalletControls__create-wallet")).toBeInTheDocument();
		});

		userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(onCreateWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onCreateWallet callback when responsive", () => {
		const onCreateWallet = vi.fn();

		renderResponsiveWithRoute(
			<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={{}} />,
			"xs",
			{
				history,
				withProfileSynchronizer: true,
			},
		);

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onCreateWallet).toHaveBeenCalledWith();
	});

	it("should execute onImportWallet callback", () => {
		const onImportWallet = vi.fn();

		render(<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />, {
			history,
			withProfileSynchronizer: true,
		});

		userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(onImportWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onImportWallet callback when responsive", () => {
		const onImportWallet = vi.fn();

		renderResponsive(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />,
			"xs",
			{
				history,
				withProfileSynchronizer: true,
			},
		);

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
