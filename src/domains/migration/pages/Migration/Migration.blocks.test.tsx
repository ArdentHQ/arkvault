import React from "react";
import userEvent from "@testing-library/user-event";
import {
	MigrationHeader,
	MigrationHeaderExtra,
	MigrationNewMigrationMobileButton,
	ContractPausedAlert,
} from "./Migration.blocks";
import { render, screen } from "@/utils/testing-library";
import * as contexts from "@/app/contexts";

describe("MigrationHeader", () => {
	it("should render", () => {
		const onNewMigrationHandler = vi.fn();

		const { asFragment } = render(<MigrationHeader onNewMigration={onNewMigrationHandler} />);

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(onNewMigrationHandler).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});

describe("MigrationHeaderExtra", () => {
	it("should render", () => {
		const onNewMigrationHandler = vi.fn();

		const { asFragment } = render(<MigrationHeaderExtra onNewMigration={onNewMigrationHandler} />);

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn"));

		expect(onNewMigrationHandler).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});

describe("MigrationNewMigrationMobileButton", () => {
	it("should render", () => {
		const onNewMigrationHandler = vi.fn();

		const { asFragment } = render(<MigrationNewMigrationMobileButton onNewMigration={onNewMigrationHandler} />);

		userEvent.click(screen.getByTestId("Migrations__add-migration-btn-mobile"));

		expect(onNewMigrationHandler).toHaveBeenCalled();

		expect(asFragment()).toMatchSnapshot();
	});
});

describe("ContractPausedAlert", () => {
	it("should render if contract is paused", () => {
		const useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			contractIsPaused: true,
		});

		render(<ContractPausedAlert />);

		expect(screen.getByTestId("ContractPausedAlert")).toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});

	it("should render empty if contract is not paused", () => {
		const useMigrationsSpy = vi.spyOn(contexts, "useMigrations").mockReturnValue({
			contractIsPaused: false,
		});

		render(<ContractPausedAlert />);

		expect(screen.queryByTestId("ContractPausedAlert")).not.toBeInTheDocument();

		useMigrationsSpy.mockRestore();
	});
});
