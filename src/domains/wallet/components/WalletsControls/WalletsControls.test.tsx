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
		update: jest.fn(),
		walletsDisplayType: "all",
	};

	it("should render", () => {
		const { container } = render(
			<WalletsControls
				onCreateWallet={jest.fn()}
				onImportWallet={jest.fn()}
				filterProperties={filterProperties}
			/>,
		);

		expect(container).toMatchSnapshot();
	});

	it.each(["xs", "sm", "md", "lg", "xl"])("should render responsive", (breakpoint) => {
		const { container } = renderResponsive(
			<WalletsControls
				onCreateWallet={jest.fn()}
				onImportWallet={jest.fn()}
				filterProperties={filterProperties}
			/>,
			breakpoint,
		);

		expect(container).toMatchSnapshot();
	});

	it("should execute onCreateWallet callback", () => {
		const onCreateWallet = jest.fn();

		render(<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={jest.fn()} filterProperties={{}} />);

		userEvent.click(screen.getByTestId("WalletControls__create-wallet"));

		expect(onCreateWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onCreateWallet callback when responsive", () => {
		const onCreateWallet = jest.fn();

		renderResponsive(
			<WalletsControls onCreateWallet={onCreateWallet} onImportWallet={jest.fn()} filterProperties={{}} />,
			"xs",
		);

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--0"));

		expect(onCreateWallet).toHaveBeenCalledWith();
	});

	it("should execute onImportWallet callback", () => {
		const onImportWallet = jest.fn();

		render(<WalletsControls onCreateWallet={jest.fn()} onImportWallet={onImportWallet} filterProperties={{}} />);

		userEvent.click(screen.getByTestId("WalletControls__import-wallet"));

		expect(onImportWallet).toHaveBeenCalledWith(expect.objectContaining({ nativeEvent: expect.any(MouseEvent) }));
	});

	it("should execute onImportWallet callback when responsive", () => {
		const onImportWallet = jest.fn();

		renderResponsive(
			<WalletsControls onCreateWallet={jest.fn()} onImportWallet={onImportWallet} filterProperties={{}} />,
			"xs",
		);

		userEvent.click(screen.getAllByTestId("dropdown__toggle")[1]);

		expect(screen.getByTestId("dropdown__content")).toBeInTheDocument();

		userEvent.click(screen.getByTestId("dropdown__option--1"));

		expect(onImportWallet).toHaveBeenCalledWith();
	});

	it("should render with networks selection", () => {
		const { container } = render(
			<WalletsControls
				onCreateWallet={jest.fn()}
				onImportWallet={jest.fn()}
				filterProperties={filterProperties as any}
			/>,
		);

		expect(container).toMatchSnapshot();
	});
});
