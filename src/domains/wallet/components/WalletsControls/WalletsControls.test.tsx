import React from "react";

import userEvent from "@testing-library/user-event";
import { WalletsControls } from "./WalletsControls";
import { FilterWalletsHookProperties } from "@/domains/dashboard/components/FilterWallets";
import { render, renderResponsive, screen } from "@/utils/testing-library";

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
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
		);

		expect(container).toMatchSnapshot();
	});

	it("should render for incompatible ledger wallet", () => {
		process.env.REACT_APP_IS_UNIT = undefined;

		const { container } = render(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { container } = renderResponsive(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
			breakpoint,
		);

		expect(container).toMatchSnapshot();
	});

	it("should execute onCreateWallet callback", async () => {
		const onCreateWallet = vi.fn();

		render(<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={{}} />);

		await userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(onCreateWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onCreateWallet callback when responsive", async () => {
		const onCreateWallet = vi.fn();

		renderResponsive(
			<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={vi.fn()} filterProperties={filterProperties} />,
			"xs",
		);

		// Await for multiple dropdown toggles to be available
		await screen.findAllByTestId("dropdown__toggle");

		// Open the dropdown content
		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await expect(screen.findAllByTestId("dropdown__option--0")).resolves.toHaveLength(1);

		await userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onCreateWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onImportWallet callback", async () => {
		const onImportWallet = vi.fn();

		render(<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />);

		await userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(onImportWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onImportWallet callback when responsive", async () => {
		const onImportWallet = vi.fn();

		renderResponsive(
			<WalletsControls onCreateWallet={vi.fn()} onImportWallet={onImportWallet} filterProperties={{}} />,
			"xs",
		);

		await userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		await userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(onImportWallet).toHaveBeenCalledWith();
	});

	it("should render with networks selection", () => {
		const { container } = render(
			<WalletsControls
				onCreateWallet={vi.fn()}
				onImportWallet={vi.fn()}
				filterProperties={filterProperties as any}
			/>,
		);

		expect(container).toMatchSnapshot();
	});
});
